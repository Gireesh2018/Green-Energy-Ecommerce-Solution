import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { schema } from "./list_GET.schema";

export async function handle(request: Request) {
  console.log("Starting orders list endpoint");
  
  try {
    // Authenticate and check admin role
    const { user } = await getServerUserSession(request);
    console.log(`User authenticated: ${user.email}, role: ${user.role}`);
    
    if (user.role !== "admin") {
      console.log("Access denied: user is not admin");
      return Response.json({ error: "Access denied. Admin role required." }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    console.log("Query parameters:", queryParams);
    
    const validatedInput = schema.parse(queryParams);
    console.log("Validated input:", validatedInput);

    // Build base query
    let query = db
      .selectFrom("orders")
      .leftJoin("users", "orders.user_id", "users.id")
      .select([
        "orders.id",
        "orders.status",
        "orders.total_amount",
        "orders.payment_status",
        "orders.payment_method",
        "orders.created_at",
        "orders.updated_at",
        "orders.shipping_address",
        "orders.billing_address",
        "orders.notes",
        "users.id as user_id",
        "users.email as user_email",
        "users.display_name as user_display_name"
      ]);

    // Apply filters
    if (validatedInput.status) {
      console.log(`Filtering by status: ${validatedInput.status}`);
      query = query.where("orders.status", "=", validatedInput.status);
    }

    if (validatedInput.user_id) {
      console.log(`Filtering by user_id: ${validatedInput.user_id}`);
      query = query.where("orders.user_id", "=", validatedInput.user_id);
    }

    if (validatedInput.start_date) {
      const startDate = new Date(validatedInput.start_date);
      console.log(`Filtering by start_date: ${startDate.toISOString()}`);
      query = query.where("orders.created_at", ">=", startDate);
    }

    if (validatedInput.end_date) {
      const endDate = new Date(validatedInput.end_date);
      console.log(`Filtering by end_date: ${endDate.toISOString()}`);
      query = query.where("orders.created_at", "<=", endDate);
    }

    // Get total count for pagination
    const countQuery = query
      .clearSelect()
      .select(db.fn.count("orders.id").as("total"));
    
    const countResult = await countQuery.executeTakeFirst();
    const totalCount = Number(countResult?.total || 0);
    console.log(`Total orders matching filters: ${totalCount}`);

    // Apply pagination
    const limit = validatedInput.limit;
    const offset = (validatedInput.page - 1) * limit;
    console.log(`Applying pagination: limit=${limit}, offset=${offset}`);

    const ordersResult = await query
      .orderBy("orders.created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    console.log(`Retrieved ${ordersResult.length} orders`);

    // Get order items for each order
    const orderIds = ordersResult.map(order => order.id);
    console.log(`Fetching order items for orders: ${orderIds.join(", ")}`);

    const orderItemsResult = orderIds.length > 0 
      ? await db
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
            "products.brand",
            "products.category",
            "products.image_url"
          ])
          .where("order_items.order_id", "in", orderIds)
          .execute()
      : [];

    console.log(`Retrieved ${orderItemsResult.length} order items`);

    // Group order items by order_id
    const orderItemsMap = orderItemsResult.reduce((acc, item) => {
      if (!acc[item.order_id!]) {
        acc[item.order_id!] = [];
      }
      acc[item.order_id!].push({
        id: item.id,
        product_id: item.product_id,
        product_title: item.product_title,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        total_price: Number(item.total_price),
        product_brand: item.brand,
        product_category: item.category,
        product_image_url: item.image_url
      });
      return acc;
    }, {} as Record<number, any[]>);

    // Format response
    const orders = ordersResult.map(order => ({
      id: order.id,
      status: order.status,
      total_amount: Number(order.total_amount),
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      created_at: order.created_at?.toISOString(),
      updated_at: order.updated_at?.toISOString(),
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      notes: order.notes,
      customer: order.user_id ? {
        id: order.user_id,
        email: order.user_email,
        display_name: order.user_display_name
      } : null,
      items: orderItemsMap[order.id] || []
    }));

    const totalPages = Math.ceil(totalCount / limit);
    
    const response = {
      orders,
      pagination: {
        current_page: validatedInput.page,
        total_pages: totalPages,
        total_count: totalCount,
        limit: limit,
        has_next: validatedInput.page < totalPages,
        has_previous: validatedInput.page > 1
      }
    };

    console.log(`Returning ${orders.length} orders with pagination info`);
    return Response.json(response);

  } catch (error) {
    console.error("Error in orders list endpoint:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json({ error: "Authentication required" }, { status: 401 });
      }
      
      // Handle validation errors
      if (error.message.includes("Invalid")) {
        return Response.json({ error: error.message }, { status: 400 });
      }
    }
    
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}