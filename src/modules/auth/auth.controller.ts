import { APIResponse } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { errorConst } from "#/src/lib/utils/error";
import { prisma } from "#/src/lib/utils/prisma";
import { Role } from "#/src/lib/utils/roles";
import { validateAuthentication } from "#/src/middlewares/authentication";
import { validateData } from "#/src/middlewares/validation";
import userService from "#/src/modules/user/user.service";
import { Request as ExReq } from "express";
import {
  Body,
  Controller,
  Middlewares,
  Post,
  Request,
  Route,
  Tags,
} from "tsoa";
import otpService from "../otp/otp.service";
import userHelpers from "../user/user.helpers";
import { getReqUser } from "./auth.helpers";
import authSerivce from "./auth.service";
import {
  AuthLogin,
  AuthLoginResponse,
  AuthSignup,
  AuthVerifyEmail,
} from "./auth.types";
import authValidations from "./auth.validations";

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  @Post("/login")
  @Middlewares(validateData(authValidations.login))
  public async login(
    @Body() body: AuthLogin
  ): Promise<APIResponse<AuthLoginResponse>> {
    const user = await userService.fetchByEmail(body.email);

    if (
      !user ||
      !user.email_verified ||
      !(await authSerivce.verifyPassword(body.password, user.password_hash))
    ) {
      this.setStatus(errorConst.unAuthenticated.code);
      return toResponse({ error: errorConst.unAuthenticated.message });
    }

    const tokens = await authSerivce.generateTokens(user);
    if (!tokens) {
      this.setStatus(errorConst.internal.code);
      return toResponse({ error: errorConst.internal.message });
    }

    return toResponse({
      data: { ...tokens, user: userHelpers.sanitize(user) },
    });
  }

  @Post("/signup")
  @Middlewares(validateData(authValidations.login))
  public async signup(
    @Body() body: AuthSignup
  ): Promise<APIResponse<AuthLoginResponse>> {
    const existingUser = await userService.fetchByEmail(body.email);
    if (existingUser) {
      this.setStatus(errorConst.alreadyExists.code);
      return toResponse({ error: errorConst.alreadyExists.message });
    }
    const user = await userService.create({ ...body, role: Role.USER });
    if (!user) {
      this.setStatus(errorConst.internal.code);
      return toResponse({ error: errorConst.internal.message });
    }
    await otpService.send(user);
    const tokens = await authSerivce.generateTokens(user);
    if (!tokens) {
      this.setStatus(errorConst.internal.code);
      return toResponse({ error: errorConst.internal.message });
    }
    return toResponse({
      data: { ...tokens, user: userHelpers.sanitize(user) },
    });
  }

  @Post("/verifyEmail")
  @Middlewares(validateData(authValidations.login.omit({ password: true })))
  public async verifyEmail(
    @Body() body: AuthVerifyEmail
  ): Promise<APIResponse<string>> {
    const user = await userService.fetchByEmail(body.email);
    if (!user) {
      this.setStatus(errorConst.notFound.code);
      return toResponse({ error: errorConst.notFound.message });
    }

    const verified = await otpService.verify(body);
    if (!verified) {
      this.setStatus(errorConst.unAuthenticated.code);
      return toResponse({ error: errorConst.unAuthenticated.message });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { email_verified: true },
    });

    return toResponse({ data: "Email successfully verified!" });
  }

  @Post("/signoutAll")
  @Middlewares(validateAuthentication)
  public async signout(@Request() req: ExReq): Promise<APIResponse<string>> {
    const user = getReqUser(req);
    await prisma.users.update({
      where: { id: user.id },
      data: { refresh_token_version: { increment: 1 } },
    });

    return toResponse({
      data: "Successfully signedout from all devices",
    });
  }
}
