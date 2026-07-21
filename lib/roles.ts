export function roleLabel(role: string): string {
  return role === "super_admin" ? "Owner" : "Admin";
}
