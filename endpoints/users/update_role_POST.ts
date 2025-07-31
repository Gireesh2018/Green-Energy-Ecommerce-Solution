import { db } from "../../helpers/db";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { schema } from "./update_role_POST.schema";

export async function handle(request: Request) {
  console.log("Starting user role update request");
  
  try {
    // Parse and validate request body
    const json = await request.json();
    console.log("Request body received:", json);
    
    const validatedInput = schema.parse(json);
    console.log("Input validation successful:", validatedInput);

    // Get current user session and verify admin role
    const { user: currentUser } = await getServerUserSession(request);
    console.log("Current user authenticated:", { id: currentUser.id, role: currentUser.role });

    if (currentUser.role !== "admin") {
      console.log("Access denied: User is not admin");
      return Response.json(
        { error: "Access denied. Admin role required." },
        { status: 403 }
      );
    }

    // Check if target user exists
    const targetUser = await db
      .selectFrom("users")
      .select(["id", "email", "display_name", "role"])
      .where("id", "=", validatedInput.userId)
      .executeTakeFirst();

    if (!targetUser) {
      console.log("Target user not found:", validatedInput.userId);
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("Target user found:", { id: targetUser.id, currentRole: targetUser.role });

    // Prevent self-demotion
    if (currentUser.id === validatedInput.userId && validatedInput.newRole === "user") {
      console.log("Self-demotion attempt blocked");
      return Response.json(
        { error: "Cannot demote yourself from admin role" },
        { status: 400 }
      );
    }

    // Check if role change is actually needed
    if (targetUser.role === validatedInput.newRole) {
      console.log("No role change needed - user already has the requested role");
      return Response.json(
        { error: `User already has the role: ${validatedInput.newRole}` },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await db
      .updateTable("users")
      .set({ 
        role: validatedInput.newRole,
        updated_at: new Date()
      })
      .where("id", "=", validatedInput.userId)
      .returning(["id", "email", "display_name", "role", "updated_at"])
      .executeTakeFirst();

    if (!updatedUser) {
      console.log("Failed to update user role");
      return Response.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }

    console.log("User role updated successfully:", {
      userId: updatedUser.id,
      newRole: updatedUser.role,
      updatedAt: updatedUser.updated_at
    });

    return Response.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.display_name,
        role: updatedUser.role as "admin" | "user",
        updatedAt: updatedUser.updated_at
      },
      message: `User role successfully updated to ${updatedUser.role}`
    });

  } catch (error) {
    console.error("Error in update_role_POST:", error);
    
    if (error instanceof Error) {
      // Handle validation errors
      if (error.name === "ZodError") {
        return Response.json(
          { error: "Invalid request data", details: error.message },
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
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}