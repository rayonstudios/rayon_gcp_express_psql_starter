import { APP_TITLE } from "#/src/lib/constants";
import * as SibApiV3Sdk from "@sendinblue/client";
import sibTemplates from "./mail.templates";

let _apiInstance: null | SibApiV3Sdk.TransactionalEmailsApi = null;

const apiInstance = () => {
  if (!_apiInstance) {
    _apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    (_apiInstance as SibApiV3Sdk.TransactionalEmailsApi).setApiKey(
      SibApiV3Sdk.TransactionalSMSApiApiKeys.apiKey as any,
      process.env.BREVO_API_KEY!
    );
  }
  return _apiInstance;
};

const sendTest = async ({ to = "maazkhawar25@atompoint.com" }) => {
  const templateId = 3;
  const testEmail = new SibApiV3Sdk.SendTestEmail();
  testEmail.emailTo = [to];
  await apiInstance().sendTestTemplate(templateId, testEmail);
};

const send = async ({
  to,
  toName,
  from = process.env.FROM_EMAIL,
  fromName = APP_TITLE,
  subject,
  template,
  text,
  html = text,
  cc = [],
}: {
  to: string | string[];
  toName?: string;
  from?: string;
  fromName?: string;
  subject?: string;
  template?: {
    id: number;
    data: any;
    tags?: string[];
  };
  text?: string;
  html?: string;
  cc?: SibApiV3Sdk.SendSmtpEmailCc[];
}) => {
  const smtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  smtpEmail.sender = new SibApiV3Sdk.SendSmtpEmailSender();
  smtpEmail.sender.name = fromName;
  smtpEmail.sender.email = from;

  if (typeof to === "string") to = [to];
  smtpEmail.to = to.map((email) => {
    const toObj = new SibApiV3Sdk.SendSmtpEmailTo();
    toObj.email = email;
    if (toName) toObj.name = toName;
    return toObj;
  });

  smtpEmail.subject = subject;

  if (cc.length) smtpEmail.cc = cc;
  if (html) smtpEmail.htmlContent = html;
  if (text) smtpEmail.textContent = text;

  if (template) {
    const { id, data, tags } = template;
    smtpEmail.templateId = id;
    smtpEmail.params = data;
    if (Array.isArray(tags)) smtpEmail.tags = tags;
  }

  await apiInstance().sendTransacEmail(smtpEmail);
};

const mailService = {
  send,
  sendTest,
  templates: sibTemplates,
};

export default mailService;
