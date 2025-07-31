import { db } from "../../helpers/db";
import { schema } from "./get_GET.schema";

export async function handle(request: Request) {
  try {
    console.log("Starting product get request");
    
    const url = new URL(request.url);
    const productId = url.searchParams.get("id");
    
    console.log("Product ID from query params:", productId);
    
    const validatedInput = schema.parse({ id: productId });
    console.log("Validated input:", validatedInput);
    
    // Query the product from database
    const product = await db
      .selectFrom("products")
      .selectAll()
      .where("id", "=", validatedInput.id)
      .where("is_active", "=", true)
      .executeTakeFirst();
    
    console.log("Product query result:", product);
    
    if (!product) {
      console.log("Product not found for ID:", validatedInput.id);
      return Response.json(
        { error: "Product not found" }, 
        { status: 404 }
      );
    }
    
    // Transform the product data to match our output type
    const productResponse = {
      id: product.id,
      title: product.title,
      description: product.description,
      brand: product.brand,
      category: product.category,
      dpPrice: parseFloat(product.dp_price),
      mrpPrice: parseFloat(product.mrp_price),
      imageUrl: product.image_url,
      specifications: product.specifications,
      stock: product.stock || 0,
      tags: product.tags || [],
      isActive: product.is_active || false,
      createdAt: product.created_at?.toISOString() || null,
      updatedAt: product.updated_at?.toISOString() || null
    };
    
    console.log("Returning product response:", productResponse);
    
    return Response.json(productResponse);
    
  } catch (error) {
    console.error("Error in product get endpoint:", error);
    
    if (error instanceof Error) {
      return Response.json(
        { error: error.message }, 
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}