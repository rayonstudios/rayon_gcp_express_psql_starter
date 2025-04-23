import { FE_URL } from "../constants";

const notification = {
  general: ({
    title,
    body,
    link,
    image,
  }: {
    title: string;
    body: string;
    link?: string;
    image?: string;
  }) => {
    return {
      id: 4,
      data: {
        title,
        body,
        link,
        image,
      },
    };
  },
};

const authentication = {
  verifyEmail: ({
    otp,
    name,
    email,
  }: {
    otp: string;
    name: string;
    email: string;
  }) => {
    return {
      id: 1,
      data: {
        otp,
        name,
        email,
        link: `${FE_URL}/verify-email?email=${email}&otp=${otp}`,
      },
    };
  },

  resetPassword: ({
    otp,
    name,
    email,
  }: {
    otp: string;
    name: string;
    email: string;
  }) => {
    return {
      id: 2,
      data: {
        otp,
        name,
        email,
        link: `${FE_URL}/reset-password?email=${email}&otp=${otp}`,
      },
    };
  },

  inviteUser: ({
    otp,
    name,
    email,
    inviter,
    role,
  }: {
    otp: string;
    name: string;
    email: string;
    inviter: string;
    role: string;
  }) => {
    return {
      id: 3,
      data: {
        name,
        inviter,
        role,
        link: `${FE_URL}/reset-password?email=${email}&otp=${otp}&new=true`,
        otp,
      },
    };
  },
};

const sibTemplates = {
  notification,
  authentication,
};

export default sibTemplates;
