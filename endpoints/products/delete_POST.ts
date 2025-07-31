import { schema } from "./delete_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  console.log("Starting product delete request");
  
  try {
    // Get user session and verify admin role
    console.log("Verifying admin authentication");
    const { user } = await getServerUserSession(request);
    
    if (user.role !== "admin") {
      console.log(`Access denied for user ${user.id} with role ${user.role}`);
      return Response.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }
    
    console.log(`Admin user ${user.id} authenticated successfully`);
    
    // Parse and validate request body
    const json = await request.json();
    const { productId } = schema.parse(json);
    
    console.log(`Attempting to delete product with ID: ${productId}`);
    
    // Check if product exists and is currently active
    const existingProduct = await db
      .selectFrom("products")
      .select(["id", "title", "is_active"])
      .where("id", "=", productId)
      .executeTakeFirst();
    
    if (!existingProduct) {
      console.log(`Product with ID ${productId} not found`);
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    if (!existingProduct.is_active) {
      console.log(`Product with ID ${productId} is already deleted`);
      return Response.json(
        { error: "Product is already deleted" },
        { status: 400 }
      );
    }
    
    console.log(`Found active product: ${existingProduct.title}`);
    
    // Perform soft delete by setting is_active to false
    const updateResult = await db
      .updateTable("products")
      .set({
        is_active: false,
        updated_at: new Date()
      })
      .where("id", "=", productId)
      .executeTakeFirst();
    
    if (updateResult.numUpdatedRows === 0n) {
      console.log(`Failed to update product ${productId} - no rows affected`);
      return Response.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }
    
    console.log(`Successfully soft deleted product ${productId} by admin ${user.id}`);
    
    return Response.json({
      success: true,
      message: "Product deleted successfully",
      productId: productId
    });
    
  } catch (error) {
    console.error("Error in product delete endpoint:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      
      // Handle validation errors from zod
      if (error.message.includes("validation")) {
        return Response.json(
          { error: "Invalid request data", details: error.message },
          { status: 400 }
        );
      }
    }
    
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}