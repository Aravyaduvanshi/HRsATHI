import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Get the current HR user's Clerk userId.
 * Throws a 401-like error if the user is not authenticated.
 * Use in Route Handlers that mutate HR-owned data.
 */
export async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized: no authenticated user");
  return userId;
}

/**
 * Get the full Clerk user object (includes email, name, etc.).
 * More expensive than getAuthenticatedUserId — use sparingly.
 */
export async function getAuthenticatedUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized: no authenticated user");
  return user;
}

/**
 * Returns the primary email address for the current Clerk user.
 */
export async function getAuthenticatedUserEmail(): Promise<string> {
  const user = await getAuthenticatedUser();
  const primary = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  );
  return primary?.emailAddress ?? "";
}
