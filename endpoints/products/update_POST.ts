import { schema } from "./update_POST.schema";
import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { CategoryType } from "../../helpers/schema";

export async function handle(request: Request) {
  console.log("Starting product update request");
  
  try {
    // Authenticate and verify admin role
    console.log("Authenticating user and checking admin role");
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
    const validatedInput = schema.parse(json);
    
    console.log(`Updating product ${validatedInput.id} with data:`, validatedInput);

    // Check if product exists
    const existingProduct = await db
      .selectFrom("products")
      .select(["id", "title"])
      .where("id", "=", validatedInput.id)
      .executeTakeFirst();

    if (!existingProduct) {
      console.log(`Product with ID ${validatedInput.id} not found`);
      return Response.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    console.log(`Found existing product: ${existingProduct.title}`);

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (validatedInput.title !== undefined) {
      updateData.title = validatedInput.title;
    }
    if (validatedInput.description !== undefined) {
      updateData.description = validatedInput.description;
    }
    if (validatedInput.brand !== undefined) {
      updateData.brand = validatedInput.brand;
    }
    if (validatedInput.category !== undefined) {
      updateData.category = validatedInput.category as CategoryType;
    }
    if (validatedInput.dp_price !== undefined) {
      updateData.dp_price = validatedInput.dp_price.toString();
    }
    if (validatedInput.mrp_price !== undefined) {
      updateData.mrp_price = validatedInput.mrp_price.toString();
    }
    if (validatedInput.stock !== undefined) {
      updateData.stock = validatedInput.stock;
    }
    if (validatedInput.is_active !== undefined) {
      updateData.is_active = validatedInput.is_active;
    }
    if (validatedInput.image_url !== undefined) {
      updateData.image_url = validatedInput.image_url;
    }
    if (validatedInput.tags !== undefined) {
      updateData.tags = validatedInput.tags;
    }
    if (validatedInput.specifications !== undefined) {
      updateData.specifications = validatedInput.specifications;
    }

    console.log("Update data prepared:", updateData);

    // Update the product
    const updatedProduct = await db
      .updateTable("products")
      .set(updateData)
      .where("id", "=", validatedInput.id)
      .returningAll()
      .executeTakeFirstOrThrow();

    console.log(`Product ${validatedInput.id} updated successfully`);

    // Return the updated product
    return Response.json({
      id: updatedProduct.id,
      title: updatedProduct.title,
      description: updatedProduct.description,
      brand: updatedProduct.brand,
      category: updatedProduct.category,
      dp_price: parseFloat(updatedProduct.dp_price),
      mrp_price: parseFloat(updatedProduct.mrp_price),
      stock: updatedProduct.stock,
      is_active: updatedProduct.is_active,
      image_url: updatedProduct.image_url,
      tags: updatedProduct.tags,
      specifications: updatedProduct.specifications,
      created_at: updatedProduct.created_at?.toISOString(),
      updated_at: updatedProduct.updated_at?.toISOString()
    });

  } catch (error) {
    console.error("Error updating product:", error);
    
    if (error instanceof Error) {
      // Handle validation errors
      if (error.name === "ZodError") {
        return Response.json(
          { error: "Invalid input data", details: error.message },
          { status: 400 }
        );
      }
      
      // Handle authentication errors
      if (error.name === "NotAuthenticatedError") {
        return Response.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      
      return Response.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return Response.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}