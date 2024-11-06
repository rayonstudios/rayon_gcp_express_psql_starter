export enum Role {
  USER = "user",
  ADMIN = "admin",
  SUPER_ADMIN = "super-admin",
}

export const isUserRole = (role: string): boolean => role === Role.USER;
export const isAdminRole = (role: string) =>
  [Role.ADMIN, Role.SUPER_ADMIN].includes(role as Role);
export const isSuperAdminRole = (role: string): boolean =>
  role === Role.SUPER_ADMIN;
