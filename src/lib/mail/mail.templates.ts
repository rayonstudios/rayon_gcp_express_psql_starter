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
      id: 2,
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
      id: 5,
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
      id: 6,
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
      id: 7,
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
