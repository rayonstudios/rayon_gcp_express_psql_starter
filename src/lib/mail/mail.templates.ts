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
      },
    };
  },

  forgotPassword: ({
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
      },
    };
  },
  createUser: ({
    name,
    inviter,
    role,
    resetPassLink,
  }: {
    name: string;
    inviter: string;
    role: string;
    resetPassLink: string;
  }) => {
    return {
      id: 3,
      data: {
        name,
        inviter,
        role,
        resetPassLink,
      },
    };
  },
};

const sibTemplates = {
  notification,
  authentication,
};

export default sibTemplates;
