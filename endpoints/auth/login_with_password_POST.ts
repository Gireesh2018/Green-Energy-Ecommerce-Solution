// adapt this to your database schema
import { db } from "../../helpers/db";
import { schema } from "./login_with_password_POST.schema";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import {
  setServerSession,
  SessionExpirationSeconds,
} from "../../helpers/getSetServerSession";
import { User } from "../../helpers/User";

export async function handle(request: Request) {
  try {
    const json = await request.json();
    const { email, password } = schema.parse(json);

    // Find user by email
    const userResults = await db
      .selectFrom("users")
      .innerJoin("user_passwords", "users.id", "user_passwords.user_id")
      .select([
        "users.id",
        "users.email",
        "users.display_name as displayName",
        "users.avatar_url as avatarUrl",
        "users.role",
        "user_passwords.password_hash as passwordHash",
      ])
      .where("users.email", "=", email)
      .limit(1)
      .execute();

    if (userResults.length === 0) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = userResults[0];

    // Verify password
    const passwordValid = await compare(password, user.passwordHash);
    if (!passwordValid) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create a new session
    const sessionId = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SessionExpirationSeconds * 1000);

    await db
      .insertInto("sessions")
      .values({
        id: sessionId,
        user_id: user.id,
        created_at: now,
        last_accessed: now,
        expires_at: expiresAt,
      })
      .execute();

    // Create response with user data (excluding sensitive information)
    const userData: User = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role as "admin" | "user",
    };

    const response = Response.json({
      user: userData,
    });

    // Set session cookie
    await setServerSession(response, {
      id: sessionId,
      createdAt: now.getTime(),
      lastAccessed: now.getTime(),
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: "Authentication failed" }, { status: 400 });
  }
}
