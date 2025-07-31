import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import { schema } from "./list_GET.schema";

export async function handle(request: Request) {
  console.log("Starting users/list_GET endpoint");
  
  try {
    // Check authentication and admin role
    const { user } = await getServerUserSession(request);
    console.log(`User ${user.id} (${user.email}) requesting user list`);
    
    if (user.role !== "admin") {
      console.log(`Access denied for user ${user.id} - not admin role`);
      return Response.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "20",
      search: url.searchParams.get("search") || "",
    };

    console.log("Query parameters:", queryParams);

    // Validate input
    const validatedInput = schema.parse(queryParams);
    const { page, limit, search } = validatedInput;

    console.log("Validated input:", validatedInput);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build base query
    let query = db
      .selectFrom("users")
      .select([
        "id",
        "email", 
        "display_name as displayName",
        "role",
        "created_at as registrationDate",
      ]);

    // Add search filter if provided
    if (search.trim()) {
      console.log(`Applying search filter: "${search}"`);
      query = query.where((eb) =>
        eb.or([
          eb("email", "ilike", `%${search}%`),
          eb("display_name", "ilike", `%${search}%`),
        ])
      );
    }

    // Get total count for pagination
    const countQuery = query
      .clearSelect()
      .clearOrderBy()
      .select((eb) => eb.fn.count<number>("id").as("count"));
    
    const countResult = await countQuery.executeTakeFirst();
    const totalUsers = countResult?.count || 0;

    console.log(`Total users matching criteria: ${totalUsers}`);

    // Get paginated results
    const users = await query
      .orderBy("created_at", "desc")
      .limit(limit)
      .offset(offset)
      .execute();

    console.log(`Retrieved ${users.length} users for page ${page}`);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const response = {
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role as "admin" | "user",
        registrationDate: user.registrationDate?.toISOString() || null,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage,
        hasPreviousPage,
      },
    };

    console.log(`Successfully returning ${users.length} users with pagination info`);
    return Response.json(response);

  } catch (error) {
    console.error("Error in users/list_GET:", error);
    
    if (error instanceof Error && error.name === "NotAuthenticatedError") {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return Response.json(
        { error: "Invalid query parameters", details: error.message },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}