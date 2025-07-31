'use server'

import { db } from "./db";
import { User } from "./User";

import {
  CleanupProbability,
  getServerSessionOrThrow,
  NotAuthenticatedError,
  SessionExpirationSeconds,
} from "./getSetServerSession";

export async function getServerUserSession(request: Request) {
  const session = await getServerSessionOrThrow(request);

  // Occasionally clean up expired sessions
  if (Math.random() < CleanupProbability) {
    const expirationDate = new Date(
      Date.now() - SessionExpirationSeconds * 1000
    );
    try {
      await db
        .deleteFrom("sessions")
        .where("last_accessed", "<", expirationDate)
        .execute();
    } catch (cleanupError) {
      // Log but don't fail the request if cleanup fails
      console.error("Session cleanup error:", cleanupError);
    }
  }

  // Query the sessions and users tables in a single join query
  const results = await db
    .selectFrom("sessions")
    .innerJoin("users", "sessions.user_id", "users.id")
    .select([
      "sessions.id as sessionId",
      "sessions.created_at as sessionCreatedAt",
      "sessions.last_accessed as sessionLastAccessed",
      "users.id",
      "users.email",
      "users.display_name as displayName",
      "users.role",
      "users.avatar_url as avatarUrl",
    ])
    .where("sessions.id", "=", session.id)
    .limit(1)
    .execute();

  if (results.length === 0) {
    throw new NotAuthenticatedError();
  }

  const result = results[0];
  const user: User = {
    id: result.id,
    email: result.email,
    displayName: result.displayName,
    avatarUrl: result.avatarUrl,
    role: result.role as "admin" | "user",
  };

  // Update the session's lastAccessed timestamp
  const now = new Date();
  await db
    .updateTable("sessions")
    .set({ last_accessed: now })
    .where("id", "=", session.id)
    .execute();

  return {
    user,
    // make sure to update the session in cookie
    session: {
      ...session,
      lastAccessed: now,
    },
  };
}
