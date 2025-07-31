import { schema } from "./update_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { setServerSession } from "../../../helpers/getSetServerSession";
import { db } from "../../../helpers/db";

export async function handle(request: Request) {
  console.log("Starting profile update request");
  
  try {
    // Get authenticated user session
    const { user, session } = await getServerUserSession(request);
    console.log(`Profile update request from user ID: ${user.id}, email: ${user.email}`);

    // Parse and validate request body
    const json = await request.json();
    console.log("Request body received:", json);
    
    const validatedInput = schema.parse(json);
    console.log("Input validation successful:", validatedInput);

    // Check if email is being changed and if it's already taken by another user
    if (validatedInput.email && validatedInput.email !== user.email) {
      console.log(`Email change requested from ${user.email} to ${validatedInput.email}`);
      
      const existingUser = await db
        .selectFrom("users")
        .select("id")
        .where("email", "=", validatedInput.email)
        .where("id", "!=", user.id)
        .limit(1)
        .execute();

      if (existingUser.length > 0) {
        console.log(`Email ${validatedInput.email} is already taken by user ID: ${existingUser[0].id}`);
        return Response.json(
          { error: "Email is already taken by another user" },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: {
      display_name?: string;
      email?: string;
      avatar_url?: string | null;
      updated_at: Date;
    } = {
      updated_at: new Date(),
    };

    if (validatedInput.displayName !== undefined) {
      updateData.display_name = validatedInput.displayName;
    }
    if (validatedInput.email !== undefined) {
      updateData.email = validatedInput.email;
    }
    if (validatedInput.avatarUrl !== undefined) {
      updateData.avatar_url = validatedInput.avatarUrl;
    }

    console.log("Updating user with data:", updateData);

    // Update user in database
    const updatedUsers = await db
      .updateTable("users")
      .set(updateData)
      .where("id", "=", user.id)
      .returning([
        "id",
        "email",
        "display_name as displayName",
        "avatar_url as avatarUrl",
        "role",
        "updated_at as updatedAt"
      ])
      .execute();

    if (updatedUsers.length === 0) {
      console.error(`Failed to update user ID: ${user.id} - user not found`);
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updatedUser = updatedUsers[0];
    console.log("User updated successfully:", updatedUser);

    // Create response with updated user data
    const response = Response.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role as "admin" | "user",
      }
    });

    // Update session cookie with latest access time
    const updatedSession = {
      ...session,
      lastAccessed: Date.now()
    };
    await setServerSession(response, updatedSession);
    console.log("Session cookie updated");

    return response;

  } catch (error) {
    console.error("Profile update error:", error);
    
    if (error instanceof Error) {
      if (error.name === "NotAuthenticatedError") {
        return Response.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      
      // Handle validation errors from zod
      if (error.message.includes("validation")) {
        return Response.json(
          { error: "Invalid input data", details: error.message },
          { status: 400 }
        );
      }
    }

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}