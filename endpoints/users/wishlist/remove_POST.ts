import { schema } from "./remove_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";

export async function handle(request: Request) {
  console.log("Starting wishlist remove endpoint");
  
  try {
    // Get authenticated user
    console.log("Getting user session");
    const { user } = await getServerUserSession(request);
    console.log(`User authenticated: ${user.id} (${user.email})`);

    // Parse and validate request body
    const json = await request.json();
    console.log("Request body:", json);
    
    const { product_id } = schema.parse(json);
    console.log(`Removing product ${product_id} from user ${user.id}'s wishlist`);

    // Remove the product from wishlist (if it exists)
    // Using delete operation - will succeed regardless of whether item was in wishlist
    const result = await db
      .deleteFrom("user_wishlists")
      .where("user_id", "=", user.id)
      .where("product_id", "=", product_id)
      .execute();

    console.log(`Delete operation completed. Rows affected: ${result.length}`);

    // Return success regardless of whether item was actually removed
    return Response.json({ 
      success: true,
      message: "Product removed from wishlist"
    });

  } catch (error) {
    console.error("Error in wishlist remove endpoint:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json(
          { success: false, message: "Authentication required" }, 
          { status: 401 }
        );
      }
      
      // Handle validation errors
      if (error.message.includes("validation")) {
        return Response.json(
          { success: false, message: "Invalid request data" }, 
          { status: 400 }
        );
      }
    }

    return Response.json(
      { success: false, message: "Internal server error" }, 
      { status: 500 }
    );
  }
}