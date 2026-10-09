export function getUserRole(user: unknown) {
  if (!user || typeof user !== "object" || !("role" in user)) {
    return undefined;
  }

  const role = (user as { role?: unknown }).role;
  return typeof role === "string" ? role : undefined;
}

export function isAdminUser(user: unknown) {
  return getUserRole(user) === "admin";
}
