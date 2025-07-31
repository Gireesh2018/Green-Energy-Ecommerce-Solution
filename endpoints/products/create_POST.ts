import { schema } from "./create_POST.schema";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";

export async function handle(request: Request) {
  console.log("Starting product creation endpoint");
  
  try {
    // Get user session and verify admin role
    console.log("Verifying admin authentication");
    const { user } = await getServerUserSession(request);
    
    if (user.role !== "admin") {
      console.log(`Access denied for user ${user.id} with role ${user.role}`);
      return Response.json(
        { error: "Admin access required" }, 
        { status: 403 }
      );
    }
    
    console.log(`Admin user ${user.id} authenticated successfully`);
    
    // Parse and validate request body
    const json = await request.json();
    console.log("Parsing request body:", json);
    
    const validatedData = schema.parse(json);
    console.log("Request validation successful");
    
    // Insert product into database
    console.log("Inserting product into database");
    const insertResult = await db
      .insertInto("products")
      .values({
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        brand: validatedData.brand,
        image_url: validatedData.imageUrl,
        dp_price: validatedData.dpPrice.toString(),
        mrp_price: validatedData.mrpPrice.toString(),
        stock: validatedData.stock,
        specifications: validatedData.specifications,
        tags: validatedData.tags,
        is_active: true,
      })
      .returning([
        "id",
        "title",
        "description", 
        "category",
        "brand",
        "image_url",
        "dp_price",
        "mrp_price",
        "stock",
        "specifications",
        "tags",
        "is_active",
        "created_at",
        "updated_at"
      ])
      .execute();
    
    if (insertResult.length === 0) {
      console.error("Failed to insert product - no result returned");
      return Response.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }
    
    const createdProduct = insertResult[0];
    console.log(`Product created successfully with ID: ${createdProduct.id}`);
    
    // Convert database result to response format
    const responseProduct = {
      id: createdProduct.id,
      title: createdProduct.title,
      description: createdProduct.description,
      category: createdProduct.category,
      brand: createdProduct.brand,
      imageUrl: createdProduct.image_url,
      dpPrice: parseFloat(createdProduct.dp_price),
      mrpPrice: parseFloat(createdProduct.mrp_price),
      stock: createdProduct.stock,
      specifications: createdProduct.specifications,
      tags: createdProduct.tags,
      isActive: createdProduct.is_active,
      createdAt: createdProduct.created_at,
      updatedAt: createdProduct.updated_at,
    };
    
    console.log("Product creation completed successfully");
    return Response.json(responseProduct);
    
  } catch (error) {
    console.error("Error in product creation endpoint:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      
      // Handle Zod validation errors
      if (error.message.includes("validation")) {
        return Response.json(
          { error: `Validation error: ${error.message}` },
          { status: 400 }
        );
      }
      
      return Response.json(
        { error: `Server error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: "Unknown server error" },
      { status: 500 }
    );
  }
}