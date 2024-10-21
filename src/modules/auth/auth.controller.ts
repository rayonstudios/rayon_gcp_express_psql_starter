import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { isImage, toResponse } from "#/src/lib/utils";
import { prisma } from "#/src/lib/utils/prisma";
import { Role } from "#/src/lib/utils/roles";
import { statusConst } from "#/src/lib/utils/status";
import { validateData } from "#/src/middlewares/validation.middleware";
import userService from "#/src/modules/user/user.service";
import {
  Body,
  Controller,
  FormField,
  Middlewares,
  Post,
  Request,
  Route,
  Security,
  Tags,
  UploadedFile,
} from "tsoa";
import fileService from "../file/file.service";
import otpService from "../otp/otp.service";
import { sanitizeUser } from "../user/user.helpers";
import { getReqUser } from "./auth.helpers";
import authSerivce from "./auth.service";
import {
  AuthLogin,
  AuthLoginResponse,
  AuthResetPass,
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
      this.setStatus(statusConst.invalidCredentials.code);
      return toResponse({ error: statusConst.invalidCredentials.message });
    }

    const tokens = await authSerivce.generateTokens(user);
    if (!tokens) {
      this.setStatus(statusConst.internal.code);
      return toResponse({ error: statusConst.internal.message });
    }

    return toResponse({
      data: { ...tokens, user: sanitizeUser(user) },
    });
  }

  @Post("/signup")
  @Middlewares(validateData(authValidations.login))
  public async signup(
    @FormField() name: string,
    @FormField() email: string,
    @FormField() password: string,
    @FormField() bio?: string,
    @UploadedFile() photo?: Express.Multer.File
  ): Promise<APIResponse<AuthLoginResponse>> {
    if (photo && !isImage(photo.mimetype)) {
      this.setStatus(statusConst.invalidData.code);
      return toResponse({
        error: "Invalid file type. Only images are allowed.",
      });
    }

    const existingUser = await userService.fetchByEmail(email);
    if (existingUser) {
      this.setStatus(statusConst.alreadyExists.code);
      return toResponse({ error: statusConst.alreadyExists.message });
    }

    let photoUrl = "";
    if (photo) {
      [photoUrl] = await fileService.save([{ ...photo }]);
    }
    // create user in db
    const user = await userService.create({
      name,
      email,
      password,
      bio,
      photo: photoUrl,
      role: Role.USER,
    });
    if (!user) {
      this.setStatus(statusConst.internal.code);
      return toResponse({ error: statusConst.internal.message });
    }
    await otpService.send(user);
    const tokens = await authSerivce.generateTokens(user);
    if (!tokens) {
      this.setStatus(statusConst.internal.code);
      return toResponse({ error: statusConst.internal.message });
    }
    return toResponse({
      data: { ...tokens, user: sanitizeUser(user) },
    });
  }

  @Post("/verifyEmail")
  @Middlewares(validateData(authValidations.login.omit({ password: true })))
  public async verifyEmail(
    @Body() body: AuthVerifyEmail
  ): Promise<APIResponse<Message>> {
    const verified = await otpService.verify(body);
    if (!verified) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({ error: statusConst.unAuthenticated.message });
    }

    await prisma.users.update({
      where: { email: body.email },
      data: { email_verified: true },
    });

    return toResponse({ data: { message: "Email successfully verified!" } });
  }

  @Post("/signoutAll")
  @Security("jwt")
  public async signout(@Request() req: ExReq): Promise<APIResponse<Message>> {
    const user = getReqUser(req);
    await prisma.users.update({
      where: { id: user.id },
      data: { refresh_token_version: { increment: 1 } },
    });

    return toResponse({
      data: { message: "Successfully signedout from all devices" },
    });
  }

  @Post("/forgotPassword")
  @Middlewares(validateData(authValidations.forgotPass))
  public async forgotPassword(
    @Body() body: AuthVerifyEmail
  ): Promise<APIResponse<Message>> {
    const user = await userService.fetchByEmail(body.email);

    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    await otpService.send(user, "forgotPassword");

    return toResponse({
      data: { message: "Forgot password email send successfully" },
    });
  }

  @Post("/resetPassword")
  @Middlewares(authValidations.resetPass)
  public async resetPassword(
    @Body() body: AuthResetPass
  ): Promise<APIResponse<Message>> {
    const { password, ...restOfBody } = body;

    const verified = await otpService.verify(restOfBody);
    if (!verified) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({ error: statusConst.unAuthenticated.message });
    }

    const newPassword = await authSerivce.hashPassword(password);

    await prisma.users.update({
      where: { email: body.email },
      data: { password_hash: newPassword },
    });

    return toResponse({
      data: { message: "=Password has been reset successfully" },
    });
  }
}
