export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export const isUserRole = (role: string): role is Role => role === Role.USER;
export const isAdminRole = (role: string): role is Role => role === Role.ADMIN;
