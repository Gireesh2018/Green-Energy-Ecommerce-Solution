import { schema } from "./list_GET.schema";
import { db } from "../../helpers/db";
import { CategoryType } from "../../helpers/schema";

export async function handle(request: Request) {
  try {
    console.log("Starting products list endpoint");
    
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    console.log("Query parameters:", queryParams);
    
    const validatedInput = schema.parse(queryParams);
    console.log("Validated input:", validatedInput);

    // Start building the query
    let query = db
      .selectFrom("products")
      .select([
        "id",
        "title",
        "description",
        "brand",
        "category",
        "dp_price",
        "mrp_price",
        "image_url",
        "stock",
        "is_active",
        "tags",
        "specifications",
        "created_at",
        "updated_at"
      ])
      .where("is_active", "=", true);

    // Apply filters
    if (validatedInput.category) {
      console.log("Filtering by category:", validatedInput.category);
      query = query.where("category", "=", validatedInput.category as CategoryType);
    }

    if (validatedInput.brand) {
      console.log("Filtering by brand:", validatedInput.brand);
      query = query.where("brand", "ilike", `%${validatedInput.brand}%`);
    }

    if (validatedInput.minPrice !== undefined) {
      console.log("Filtering by min price:", validatedInput.minPrice);
      query = query.where("dp_price", ">=", validatedInput.minPrice.toString());
    }

    if (validatedInput.maxPrice !== undefined) {
      console.log("Filtering by max price:", validatedInput.maxPrice);
      query = query.where("dp_price", "<=", validatedInput.maxPrice.toString());
    }

    if (validatedInput.tags && validatedInput.tags.length > 0) {
      console.log("Filtering by tags:", validatedInput.tags);
      // Use PostgreSQL array overlap operator
      query = query.where("tags", "&&", validatedInput.tags);
    }

    if (validatedInput.search) {
      console.log("Filtering by search term:", validatedInput.search);
      const searchTerm = `%${validatedInput.search}%`;
      query = query.where((eb) =>
        eb.or([
          eb("title", "ilike", searchTerm),
          eb("description", "ilike", searchTerm),
          eb("brand", "ilike", searchTerm)
        ])
      );
    }

    // Apply sorting
    const sortBy = validatedInput.sortBy || "created_at";
    const sortOrder = validatedInput.sortOrder || "desc";
    console.log("Sorting by:", sortBy, sortOrder);

    switch (sortBy) {
      case "price":
        query = query.orderBy("dp_price", sortOrder);
        break;
      case "name":
        query = query.orderBy("title", sortOrder);
        break;
      case "created_at":
        query = query.orderBy("created_at", sortOrder);
        break;
    }

    // Get total count for pagination
    const countQuery = query.clearSelect().clearOrderBy().select((eb) => eb.fn.count("id").as("count"));
    const countResult = await countQuery.executeTakeFirst();
    const totalCount = Number(countResult?.count || 0);
    console.log("Total count:", totalCount);

    // Apply pagination
    const page = validatedInput.page || 1;
    const limit = validatedInput.limit || 20;
    const offset = (page - 1) * limit;
    console.log("Pagination - page:", page, "limit:", limit, "offset:", offset);

    query = query.limit(limit).offset(offset);

    // Execute the query
    const products = await query.execute();
    console.log("Found products:", products.length);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const result = {
      products: products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        brand: product.brand,
        category: product.category,
        dpPrice: Number(product.dp_price),
        mrpPrice: Number(product.mrp_price),
        imageUrl: product.image_url,
        stock: product.stock || 0,
        stockStatus: (product.stock || 0) > 0 ? "in_stock" as const : "out_of_stock" as const,
        isActive: product.is_active || false,
        tags: product.tags || [],
        specifications: product.specifications,
        createdAt: product.created_at?.toISOString(),
        updatedAt: product.updated_at?.toISOString()
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPreviousPage
      }
    };

    console.log("Returning result with", result.products.length, "products");
    return Response.json(result);

  } catch (error) {
    console.error("Error in products list endpoint:", error);
    
    if (error instanceof Error) {
      return Response.json(
        { message: `Failed to fetch products: ${error.message}` },
        { status: 400 }
      );
    }
    
    return Response.json(
      { message: "Failed to fetch products due to unknown error" },
      { status: 500 }
    );
  }
}