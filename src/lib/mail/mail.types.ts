import sibTemplates from "../mail/mail.templates";

export type AuthTemplateType = keyof typeof sibTemplates.authentication;

export type AuthTemplateParams = Parameters<
  (typeof sibTemplates.authentication)[AuthTemplateType]
>[0];
