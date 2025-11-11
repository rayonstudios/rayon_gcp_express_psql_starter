import { APIResponse, ExReq, Message } from "#/src/lib/types/misc";
import { GenericObject } from "#/src/lib/types/utils";
import { toResponse } from "#/src/lib/utils";
import { statusConst } from "#/src/lib/utils/status";
import {
  Body,
  Controller,
  Get,
  Path,
  Post,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import { bgJobsService } from "./bg-jobs.service";
import { BgJob, BgJobHandlerBody, BgJobStatus } from "./bg-jobs.types";

@Route("bg-jobs")
@Tags("Background Jobs")
export class BgJobsController extends Controller {
  @Post("/handler")
  @Security("api_key")
  public async handleBgJob(
    @Body() body: BgJobHandlerBody
  ): Promise<APIResponse<Message>> {
    let result: GenericObject = {};
    const { taskId } = body;

    // 1 - Update the bg-task in Firestore to IN_PROGRESS status
    await bgJobsService.save(taskId, {
      status: BgJobStatus.IN_PROGRESS,
      updatedAt: new Date(),
    });

    try {
      // 2 - Handle the task based on it's job type
      result = await bgJobsService.handle(body);

      // 3 - Update the bg-task in Firestore to SUCCESS status
      await bgJobsService.save(taskId, {
        status: BgJobStatus.SUCCESS,
        resultDetails: result,
        updatedAt: new Date(),
      });
    } catch (error) {
      // 4 - Update the bg-task in Firestore to FAILED status
      await bgJobsService
        .save(taskId, {
          status: BgJobStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : JSON.stringify(error),
          updatedAt: new Date(),
        })
        .catch((e) =>
          console.error(
            `Failed to update "failed" status of job: ${body.job} with id ${body.taskId}`,
            e
          )
        );

      console.error(
        `Failed to handle job: ${body.job} with id ${body.taskId}`,
        error
      );

      // Throw error to return 500 status code, allowing Cloud Tasks to retry
      throw error;
    }

    return toResponse({
      data: { message: "Handled" } as Message,
    });
  }

  @Get("/{taskId}")
  @Security("jwt")
  public async getBgJob(
    @Path() taskId: string,
    @Request() req: ExReq
  ): Promise<APIResponse<BgJob>> {
    const reqUser = getReqUser(req);

    const job = await bgJobsService.get(taskId);
    if (!job || job.createdBy !== reqUser.id) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    return toResponse({ data: job });
  }
}
