import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { sql } from "kysely";

export async function handle(request: Request) {
  console.log("Starting dashboard analytics request");
  
  try {
    // Authenticate and verify admin role
    const { user } = await getServerUserSession(request);
    console.log(`User authenticated: ${user.email}, role: ${user.role}`);
    
    if (user.role !== "admin") {
      console.log("Access denied: user is not admin");
      return Response.json({ message: "Access denied. Admin role required." }, { status: 403 });
    }

    console.log("Fetching dashboard analytics data");

    // Get total sales amount
    console.log("Calculating total sales");
    const totalSalesResult = await db
      .selectFrom("orders")
      .select(sql<string>`COALESCE(SUM(total_amount), 0)`.as("total"))
      .where("status", "!=", "cancelled")
      .executeTakeFirst();
    
    const totalSales = parseFloat(totalSalesResult?.total || "0");
    console.log(`Total sales: ${totalSales}`);

    // Get order counts by status
    console.log("Calculating order counts by status");
    const orderStatusCounts = await db
      .selectFrom("orders")
      .select(["status", sql<string>`COUNT(*)`.as("count")])
      .groupBy("status")
      .execute();
    
    console.log(`Order status counts: ${JSON.stringify(orderStatusCounts)}`);

    // Get top selling products (by quantity sold)
    console.log("Fetching top selling products");
    const topSellingProducts = await db
      .selectFrom("order_items")
      .innerJoin("products", "order_items.product_id", "products.id")
      .innerJoin("orders", "order_items.order_id", "orders.id")
      .select([
        "products.id",
        "products.title",
        "products.brand",
        "products.category",
        "products.dp_price",
        sql<string>`SUM(order_items.quantity)`.as("total_quantity_sold"),
        sql<string>`SUM(order_items.total_price)`.as("total_revenue")
      ])
      .where("orders.status", "!=", "cancelled")
      .groupBy(["products.id", "products.title", "products.brand", "products.category", "products.dp_price"])
      .orderBy(sql`SUM(order_items.quantity)`, "desc")
      .limit(10)
      .execute();
    
    console.log(`Top selling products count: ${topSellingProducts.length}`);

    // Get recent orders (last 10)
    console.log("Fetching recent orders");
    const recentOrders = await db
      .selectFrom("orders")
      .leftJoin("users", "orders.user_id", "users.id")
      .select([
        "orders.id",
        "orders.total_amount",
        "orders.status",
        "orders.payment_status",
        "orders.created_at",
        "users.display_name as customer_name",
        "users.email as customer_email"
      ])
      .orderBy("orders.created_at", "desc")
      .limit(10)
      .execute();
    
    console.log(`Recent orders count: ${recentOrders.length}`);

    // Get revenue trends for the last 30 days
    console.log("Calculating revenue trends");
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const revenueTrends = await db
      .selectFrom("orders")
      .select([
        sql<string>`DATE(created_at)`.as("date"),
        sql<string>`SUM(total_amount)`.as("revenue"),
        sql<string>`COUNT(*)`.as("order_count")
      ])
      .where("created_at", ">=", thirtyDaysAgo)
      .where("status", "!=", "cancelled")
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`, "asc")
      .execute();
    
    console.log(`Revenue trends data points: ${revenueTrends.length}`);

    // Get total order count
    console.log("Calculating total order count");
    const totalOrdersResult = await db
      .selectFrom("orders")
      .select(sql<string>`COUNT(*)`.as("count"))
      .executeTakeFirst();
    
    const totalOrders = parseInt(totalOrdersResult?.count || "0");
    console.log(`Total orders: ${totalOrders}`);

    // Get total product count
    console.log("Calculating total product count");
    const totalProductsResult = await db
      .selectFrom("products")
      .select(sql<string>`COUNT(*)`.as("count"))
      .where("is_active", "=", true)
      .executeTakeFirst();
    
    const totalProducts = parseInt(totalProductsResult?.count || "0");
    console.log(`Total active products: ${totalProducts}`);

    // Get total customer count
    console.log("Calculating total customer count");
    const totalCustomersResult = await db
      .selectFrom("users")
      .select(sql<string>`COUNT(*)`.as("count"))
      .where("role", "=", "user")
      .executeTakeFirst();
    
    const totalCustomers = parseInt(totalCustomersResult?.count || "0");
    console.log(`Total customers: ${totalCustomers}`);

    // Format the response
    const dashboardData = {
      summary: {
        totalSales,
        totalOrders,
        totalProducts,
        totalCustomers
      },
      ordersByStatus: orderStatusCounts.map(item => ({
        status: item.status,
        count: parseInt(item.count)
      })),
      topSellingProducts: topSellingProducts.map(product => ({
        id: product.id,
        title: product.title,
        brand: product.brand,
        category: product.category,
        price: parseFloat(product.dp_price),
        quantitySold: parseInt(product.total_quantity_sold),
        revenue: parseFloat(product.total_revenue)
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        totalAmount: parseFloat(order.total_amount),
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at?.toISOString(),
        customerName: order.customer_name,
        customerEmail: order.customer_email
      })),
      revenueTrends: revenueTrends.map(trend => ({
        date: trend.date,
        revenue: parseFloat(trend.revenue),
        orderCount: parseInt(trend.order_count)
      }))
    };

    console.log("Dashboard analytics data compiled successfully");
    return Response.json(dashboardData);

  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json({ message: "Authentication required" }, { status: 401 });
      }
      return Response.json({ message: `Failed to fetch dashboard analytics: ${error.message}` }, { status: 500 });
    }
    
    return Response.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}