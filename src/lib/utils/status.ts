export const statusConst = {
  success: {
    message: "Success",
    code: 200,
  },
  created: {
    message: "Resource created",
    code: 201,
  },
  unAuthenticated: {
    message: "User is not authenticated",
    code: 401,
  },
  invalidCredentials: {
    message: "Invalid credentials",
    code: 401,
  },
  unAuthorized: {
    message:
      "Access denied. You do not have the required role to perform this action.",
    code: 403,
  },
  invalidData: {
    message: "Request data is invalid",
    code: 422,
  },
  notFound: {
    message: "Resource not found",
    code: 404,
  },
  internal: {
    message: "Internal server error",
    code: 500,
  },
  alreadyExists: {
    message: "Resource already exists",
    code: 409,
  },
};
