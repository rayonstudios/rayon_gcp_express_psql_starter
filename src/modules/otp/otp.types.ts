export type TemplateMethod = "verifyEmail" | "forgotPassword" | "createUser";
export type TemplateParams =
  | { otp: string; name: string; email: string } // For verifyEmail and forgot email
  | { name: string; inviter: string; role: string; resetPassLink: string }; // For createUser
