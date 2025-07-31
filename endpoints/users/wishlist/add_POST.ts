import { schema } from "./add_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";

export async function handle(request: Request) {
  console.log("Starting wishlist add request");
  
  try {
    // Get authenticated user
    console.log("Authenticating user");
    const { user } = await getServerUserSession(request);
    console.log(`User authenticated: ${user.id} (${user.email})`);

    // Parse and validate request body
    const json = await request.json();
    console.log("Request body received:", json);
    
    const { product_id } = schema.parse(json);
    console.log(`Adding product ${product_id} to wishlist for user ${user.id}`);

    // Check if product exists and is active
    console.log(`Checking if product ${product_id} exists and is active`);
    const product = await db
      .selectFrom("products")
      .select(["id", "title", "is_active"])
      .where("id", "=", product_id)
      .where("is_active", "=", true)
      .executeTakeFirst();

    if (!product) {
      console.log(`Product ${product_id} not found or inactive`);
      return Response.json(
        { 
          success: false, 
          message: "Product not found or is no longer available" 
        }, 
        { status: 404 }
      );
    }

    console.log(`Product found: ${product.title}`);

    // Check if product is already in user's wishlist
    console.log(`Checking for existing wishlist entry for user ${user.id} and product ${product_id}`);
    const existingWishlistItem = await db
      .selectFrom("user_wishlists")
      .select("id")
      .where("user_id", "=", user.id)
      .where("product_id", "=", product_id)
      .executeTakeFirst();

    if (existingWishlistItem) {
      console.log(`Product ${product_id} already in wishlist for user ${user.id}`);
      return Response.json({
        success: false,
        message: "Product is already in your wishlist"
      }, { status: 409 });
    }

    // Add product to wishlist
    console.log(`Adding product ${product_id} to wishlist for user ${user.id}`);
    const result = await db
      .insertInto("user_wishlists")
      .values({
        user_id: user.id,
        product_id: product_id
      })
      .returning("id")
      .executeTakeFirst();

    if (!result) {
      console.error("Failed to insert wishlist item");
      return Response.json(
        { 
          success: false, 
          message: "Failed to add product to wishlist" 
        }, 
        { status: 500 }
      );
    }

    console.log(`Successfully added product ${product_id} to wishlist with ID ${result.id}`);
    
    return Response.json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlist_item_id: result.id
    });

  } catch (error) {
    console.error("Error in wishlist add endpoint:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json(
          { 
            success: false, 
            message: "Authentication required" 
          }, 
          { status: 401 }
        );
      }
      
      // Handle validation errors from zod
      if (error.message.includes("validation")) {
        return Response.json(
          { 
            success: false, 
            message: "Invalid request data" 
          }, 
          { status: 400 }
        );
      }
    }

    return Response.json(
      { 
        success: false, 
        message: "Internal server error" 
      }, 
      { status: 500 }
    );
  }
}