import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema } from "./wishlist_GET.schema";

export async function handle(request: Request) {
  console.log("Starting wishlist_GET endpoint");
  
  try {
    // Get authenticated user
    console.log("Authenticating user session");
    const { user } = await getServerUserSession(request);
    console.log(`Authenticated user: ${user.id} (${user.email})`);

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    console.log("Query parameters:", queryParams);

    const validatedInput = schema.parse(queryParams);
    console.log("Validated input:", validatedInput);

    const { page, limit } = validatedInput;
    const offset = (page - 1) * limit;

    console.log(`Fetching wishlist for user ${user.id} with pagination: page=${page}, limit=${limit}, offset=${offset}`);

    // Query the user_wishlists table (confirmed to exist in schema)
    // This is a junction table connecting users to their wishlist products
    
    // First, get total count of wishlist items
    console.log("Getting total count of wishlist items");
    const countResult = await db
      .selectFrom("user_wishlists")
      .select(db.fn.count<number>("product_id").as("total"))
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    const totalItems = countResult?.total || 0;
    console.log(`Total wishlist items: ${totalItems}`);

    // Get wishlist products with pagination
    console.log("Fetching wishlist products");
    const wishlistProducts = await db
      .selectFrom("user_wishlists")
      .innerJoin("products", "user_wishlists.product_id", "products.id")
      .select([
        "products.id",
        "products.title",
        "products.description",
        "products.brand",
        "products.category",
        "products.dp_price",
        "products.mrp_price",
        "products.image_url",
        "products.stock",
        "products.is_active",
        "products.tags",
        "products.specifications",
        "user_wishlists.created_at as added_to_wishlist_at"
      ])
      .where("user_wishlists.user_id", "=", user.id)
      .where("products.is_active", "=", true)
      .orderBy("user_wishlists.created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    console.log(`Found ${wishlistProducts.length} wishlist products`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response = {
      products: wishlistProducts.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        brand: product.brand,
        category: product.category,
        dpPrice: parseFloat(product.dp_price),
        mrpPrice: parseFloat(product.mrp_price),
        imageUrl: product.image_url,
        stock: product.stock,
        isActive: product.is_active,
        tags: product.tags,
        specifications: product.specifications,
        addedToWishlistAt: product.added_to_wishlist_at
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage,
        hasPreviousPage
      }
    };

    console.log("Successfully fetched wishlist with pagination:", {
      productsCount: response.products.length,
      pagination: response.pagination
    });

    return Response.json(response);

  } catch (error) {
    console.error("Error in wishlist_GET endpoint:", error);
    
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json(
        { message: "Authentication required to access wishlist" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { message: "Invalid query parameters", details: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}