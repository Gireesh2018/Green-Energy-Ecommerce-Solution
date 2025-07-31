import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { schema } from "./orders_GET.schema";

export async function handle(request: Request) {
  console.log("Starting orders_GET endpoint");
  
  try {
    // Get authenticated user
    const { user } = await getServerUserSession(request);
    console.log(`Fetching orders for user ID: ${user.id}`);

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    console.log("Query parameters:", queryParams);

    const validatedInput = schema.parse(queryParams);
    console.log("Validated input:", validatedInput);

    const { page, limit, status } = validatedInput;
    const offset = (page - 1) * limit;

    // Build base query for orders
    let ordersQuery = db
      .selectFrom("orders")
      .where("user_id", "=", user.id);

    // Apply status filter if provided
    if (status) {
      ordersQuery = ordersQuery.where("status", "=", status);
      console.log(`Filtering by status: ${status}`);
    }

    // Get total count for pagination
    const totalCountResult = await ordersQuery
      .select(db.fn.count<number>("id").as("count"))
      .executeTakeFirst();
    
    const totalCount = totalCountResult?.count || 0;
    console.log(`Total orders count: ${totalCount}`);

    // Get paginated orders with order items and product details
    const orders = await ordersQuery
      .selectAll("orders")
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    console.log(`Found ${orders.length} orders for current page`);

    // Get order items for all orders in this page
    const orderIds = orders.map(order => order.id);
    let orderItems: any[] = [];
    
    if (orderIds.length > 0) {
      orderItems = await db
        .selectFrom("order_items")
        .leftJoin("products", "order_items.product_id", "products.id")
        .select([
          "order_items.id",
          "order_items.order_id",
          "order_items.product_id",
          "order_items.product_title",
          "order_items.quantity",
          "order_items.unit_price",
          "order_items.total_price",
          "products.image_url",
          "products.brand",
          "products.category"
        ])
        .where("order_items.order_id", "in", orderIds)
        .execute();
      
      console.log(`Found ${orderItems.length} order items`);
    }

    // Group order items by order_id
    const orderItemsMap = orderItems.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push({
        id: item.id,
        productId: item.product_id,
        productTitle: item.product_title,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalPrice: parseFloat(item.total_price),
        imageUrl: item.image_url,
        brand: item.brand,
        category: item.category
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Format orders response
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: parseFloat(order.total_amount),
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      notes: order.notes,
      createdAt: order.created_at?.toISOString(),
      updatedAt: order.updated_at?.toISOString(),
      items: orderItemsMap[order.id] || []
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response = {
      orders: formattedOrders,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPreviousPage
      }
    };

    console.log(`Successfully returning ${formattedOrders.length} orders with pagination info`);
    return Response.json(response);

  } catch (error) {
    console.error("Error in orders_GET endpoint:", error);
    
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json({ message: "Authentication required" }, { status: 401 });
    }
    
    if (error instanceof Error && error.name === "ZodError") {
      return Response.json({ message: "Invalid query parameters", details: error.message }, { status: 400 });
    }
    
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}