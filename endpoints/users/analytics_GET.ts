import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { schema } from "./analytics_GET.schema";

export async function handle(request: Request) {
  console.log("Starting user analytics endpoint");
  
  try {
    // Authenticate user
    const { user } = await getServerUserSession(request);
    console.log(`Fetching analytics for user ID: ${user.id}`);

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedInput = schema.parse(queryParams);
    
    console.log("Validated input:", validatedInput);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (validatedInput.period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Fetch user analytics from user_analytics table
    const userAnalytics = await db
      .selectFrom("user_analytics")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirst();

    console.log("User analytics from table:", userAnalytics);

    // Fetch orders for the specified period
    const ordersInPeriod = await db
      .selectFrom("orders")
      .selectAll()
      .where("user_id", "=", user.id)
      .where("created_at", ">=", startDate)
      .where("created_at", "<=", endDate)
      .orderBy("created_at", "desc")
      .execute();

    console.log(`Found ${ordersInPeriod.length} orders in period`);

    // Calculate order status breakdown for the period
    const orderStatusBreakdown = ordersInPeriod.reduce((acc, order) => {
      const status = order.status || "pending";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("Order status breakdown:", orderStatusBreakdown);

    // Calculate total amount for the period
    const totalAmountInPeriod = ordersInPeriod.reduce((sum, order) => {
      return sum + parseFloat(order.total_amount.toString());
    }, 0);

    console.log(`Total amount in period: ${totalAmountInPeriod}`);

    // Fetch recent order items for activity
    const recentOrderItems = await db
      .selectFrom("order_items")
      .innerJoin("orders", "order_items.order_id", "orders.id")
      .select([
        "order_items.product_title",
        "order_items.quantity",
        "order_items.total_price",
        "orders.created_at",
        "orders.status"
      ])
      .where("orders.user_id", "=", user.id)
      .where("orders.created_at", ">=", startDate)
      .where("orders.created_at", "<=", endDate)
      .orderBy("orders.created_at", "desc")
      .limit(10)
      .execute();

    console.log(`Found ${recentOrderItems.length} recent order items`);

    // Fetch favorite categories based on order history
    const categoryStats = await db
      .selectFrom("order_items")
      .innerJoin("orders", "order_items.order_id", "orders.id")
      .innerJoin("products", "order_items.product_id", "products.id")
      .select([
        "products.category",
        db.fn.count("order_items.id").as("order_count"),
        db.fn.sum("order_items.total_price").as("total_spent")
      ])
      .where("orders.user_id", "=", user.id)
      .where("orders.created_at", ">=", startDate)
      .where("orders.created_at", "<=", endDate)
      .groupBy("products.category")
      .orderBy("order_count", "desc")
      .limit(5)
      .execute();

    console.log("Category stats:", categoryStats);

    // Calculate average order value for the period
    const averageOrderValue = ordersInPeriod.length > 0 
      ? totalAmountInPeriod / ordersInPeriod.length 
      : 0;

    console.log(`Average order value: ${averageOrderValue}`);

    const response = {
      totalOrders: userAnalytics?.total_orders || 0,
      totalAmountSpent: parseFloat(userAnalytics?.total_spent?.toString() || "0"),
      ordersInPeriod: ordersInPeriod.length,
      amountInPeriod: totalAmountInPeriod,
      averageOrderValue,
      orderStatusBreakdown: {
        pending: userAnalytics?.orders_pending || 0,
        processing: orderStatusBreakdown.processing || 0,
        shipped: orderStatusBreakdown.shipped || 0,
        delivered: userAnalytics?.orders_completed || 0,
        cancelled: userAnalytics?.orders_cancelled || 0
      },
      orderStatusBreakdownPeriod: {
        pending: orderStatusBreakdown.pending || 0,
        processing: orderStatusBreakdown.processing || 0,
        shipped: orderStatusBreakdown.shipped || 0,
        delivered: orderStatusBreakdown.delivered || 0,
        cancelled: orderStatusBreakdown.cancelled || 0
      },
      recentActivity: recentOrderItems.map(item => ({
        productTitle: item.product_title,
        quantity: item.quantity,
        totalPrice: parseFloat(item.total_price.toString()),
        orderDate: item.created_at?.toISOString() || "",
        status: item.status || "pending"
      })),
      favoriteCategories: categoryStats.map(stat => ({
        category: stat.category,
        orderCount: Number(stat.order_count),
        totalSpent: parseFloat(stat.total_spent?.toString() || "0")
      })),
      lastOrderDate: userAnalytics?.last_order_date?.toISOString() || null,
      period: validatedInput.period
    };

    console.log("Returning analytics response:", response);

    return Response.json(response);

  } catch (error) {
    console.error("Error in user analytics endpoint:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json({ message: "Authentication required" }, { status: 401 });
      }
      return Response.json({ message: error.message }, { status: 400 });
    }
    
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}