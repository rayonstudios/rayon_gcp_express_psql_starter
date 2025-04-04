import mailService from "#/src/lib/mail/mail.service";
import otpService from "#/src/lib/otp/otp.service";
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
import notificationService from "../notification/notification.service";
import { NotificationEvent } from "../notification/notification.types";
import userSerializer from "../user/user.serializer";
import { SanitizedUser } from "../user/user.types";
import { getReqUser } from "./auth.helpers";
import authSerializer from "./auth.serializer";
import authSerivce from "./auth.service";
import {
  AuthChangePass,
  AuthForgotPass,
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
      data: authSerializer.login(tokens, user),
    });
  }

  @Post("/signup")
  @Middlewares(validateData(authValidations.login))
  public async signup(
    @Request() req: ExReq,
    @FormField() name: string,
    @FormField() email: string,
    @FormField() password: string,
    @FormField() bio?: string,
    @FormField() hcaptcha_token?: string,
    @UploadedFile() photo?: Express.Multer.File
  ): Promise<APIResponse<SanitizedUser>> {
    if (!(await authSerivce.verifyHcaptcha(hcaptcha_token || "", req))) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({
        error: "Hcaptch verification failed",
      });
    }

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

    const user = await userService.create({
      name,
      email,
      password,
      bio,
      photo: photoUrl,
      role: Role.USER,
    });

    await fileService.resizeImg(photoUrl, {
      model: "users",
      record_id: user.id,
      img_field: "photo",
      sizes: ["small", "medium"],
    });

    const otp = await otpService.create(user.email);

    await mailService.send({
      to: user.email,
      template: mailService.templates.authentication.verifyEmail({
        otp,
        name: user.name,
        email: user.email,
      }),
    });

    await notificationService.trigger({
      event: NotificationEvent.SIGN_UP,
      data: {
        name: user.name,
        email: user.email,
      },
    });

    return toResponse({
      data: userSerializer.single(user),
    });
  }

  @Post("/verify-email")
  @Middlewares(validateData(authValidations.resetPass.omit({ password: true })))
  public async verifyEmail(
    @Body() body: AuthVerifyEmail
  ): Promise<APIResponse<AuthLoginResponse>> {
    const { email, otp } = body;
    const verified = await otpService.verify({ email, otp });
    if (!verified) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({ error: statusConst.unAuthenticated.message });
    }

    const user = await prisma.users.update({
      where: { email },
      data: { email_verified: true },
    });

    const tokens = await authSerivce.generateTokens(user);
    if (!tokens) {
      this.setStatus(statusConst.internal.code);
      return toResponse({ error: statusConst.internal.message });
    }

    return toResponse({
      data: authSerializer.login(tokens, user),
    });
  }

  @Post("/signout-all")
  @Security("jwt")
  public async signout(@Request() req: ExReq): Promise<APIResponse<Message>> {
    const { id } = getReqUser(req);
    await prisma.users.update({
      where: { id },
      data: { refresh_token_version: { increment: 1 } },
    });

    return toResponse({
      data: { message: "Successfully signed out from all devices!" },
    });
  }

  @Post("/forgot-password")
  @Middlewares(validateData(authValidations.forgotPass))
  public async forgotPassword(
    @Request() req: ExReq,
    @Body() body: AuthForgotPass
  ): Promise<APIResponse<Message>> {
    if (!(await authSerivce.verifyHcaptcha(body.hcaptcha_token || "", req))) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({
        error: "Hcaptch verification failed",
      });
    }

    const user = await userService.fetchByEmail(body.email);

    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    const otp = await otpService.create(user.email);

    await mailService.send({
      to: user.email,
      template: mailService.templates.authentication.resetPassword({
        otp,
        name: user.name,
        email: user.email,
      }),
    });

    return toResponse({
      data: { message: "Forgot password email sent successfully!" },
    });
  }

  @Post("/reset-password")
  @Middlewares(validateData(authValidations.resetPass))
  public async resetPassword(
    @Body() body: AuthResetPass
  ): Promise<APIResponse<Message>> {
    const { password, email, otp } = body;

    const verified = await otpService.verify({ email, otp });
    if (!verified) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({ error: statusConst.unAuthenticated.message });
    }

    const newPassword = await authSerivce.hashPassword(password);

    await prisma.users.update({
      where: { email },
      data: { password_hash: newPassword, email_verified: true },
    });

    return toResponse({
      data: { message: "Password has been reset successfully!" },
    });
  }

  @Post("/change-password")
  @Security("jwt")
  @Middlewares(validateData(authValidations.changePass))
  public async changePassword(
    @Body() body: AuthChangePass,
    @Request() req: ExReq
  ): Promise<APIResponse<Message>> {
    const { id } = getReqUser(req);
    const { password } = body;

    const newHashedPassword = await authSerivce.hashPassword(password);

    await prisma.users.update({
      where: {
        id,
      },
      data: {
        password_hash: newHashedPassword,
      },
    });

    return toResponse({
      data: { message: "Password has been changed  successfully" },
    });
  }

  @Post("/resend-verification")
  @Middlewares(validateData(authValidations.forgotPass))
  public async resendVerification(
    @Request() req: ExReq,
    @Body() body: AuthForgotPass
  ): Promise<APIResponse<Message>> {
    if (!(await authSerivce.verifyHcaptcha(body.hcaptcha_token || "", req))) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({
        error: "Hcaptch verification failed",
      });
    }

    const user = await userService.fetchByEmail(body.email);
    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    const otp = await otpService.create(user.email);

    await mailService.send({
      to: user.email,
      template: mailService.templates.authentication.verifyEmail({
        otp,
        name: user.name,
        email: user.email,
      }),
    });

    return toResponse({
      data: { message: "Verification Mail has been sent  successfully" },
    });
  }

  @Post("/refresh")
  @Security("jwt")
  public async refresh(
    @Request() req: ExReq
  ): Promise<APIResponse<Omit<AuthLoginResponse, "user">>> {
    const { id } = getReqUser(req);

    const user = await userService.fetch(id);
    if (!user) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    const tokens = await authSerivce.generateTokens(user);
    if (!tokens) {
      this.setStatus(statusConst.internal.code);
      return toResponse({ error: statusConst.internal.message });
    }

    return toResponse({
      data: tokens,
    });
  }
}
