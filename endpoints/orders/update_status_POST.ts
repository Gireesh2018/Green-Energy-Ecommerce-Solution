import { schema } from "./update_status_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  console.log("Starting order status update request");
  
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
    const validatedInput = schema.parse(json);
    
    console.log(`Updating order ${validatedInput.orderId} status to ${validatedInput.status}`);
    
    // Check if order exists
    const existingOrder = await db
      .selectFrom("orders")
      .select(["id", "status"])
      .where("id", "=", validatedInput.orderId)
      .executeTakeFirst();
    
    if (!existingOrder) {
      console.log(`Order ${validatedInput.orderId} not found`);
      return Response.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    console.log(`Found existing order with status: ${existingOrder.status}`);
    
    // Update order status
    const updatedOrder = await db
      .updateTable("orders")
      .set({
        status: validatedInput.status,
        updated_at: new Date(),
      })
      .where("id", "=", validatedInput.orderId)
      .returning([
        "id",
        "status",
        "total_amount",
        "created_at",
        "updated_at",
        "user_id",
        "payment_status",
        "payment_method",
        "shipping_address",
        "billing_address",
        "notes"
      ])
      .executeTakeFirst();
    
    if (!updatedOrder) {
      console.log(`Failed to update order ${validatedInput.orderId}`);
      return Response.json(
        { error: "Failed to update order status" },
        { status: 500 }
      );
    }
    
    console.log(`Successfully updated order ${validatedInput.orderId} status from ${existingOrder.status} to ${updatedOrder.status}`);
    
    return Response.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        totalAmount: updatedOrder.total_amount,
        createdAt: updatedOrder.created_at,
        updatedAt: updatedOrder.updated_at,
        userId: updatedOrder.user_id,
        paymentStatus: updatedOrder.payment_status,
        paymentMethod: updatedOrder.payment_method,
        shippingAddress: updatedOrder.shipping_address,
        billingAddress: updatedOrder.billing_address,
        notes: updatedOrder.notes,
      },
    });
    
  } catch (error) {
    console.error("Error updating order status:", error);
    
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
          { error: "Invalid request data", details: error.message },
          { status: 400 }
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