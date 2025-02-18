import { APIResponse, ExReq } from "#/src/lib/types/misc";
import { toResponse } from "#/src/lib/utils";
import { PaginationResponse } from "#/src/lib/utils/pagination";
import { statusConst } from "#/src/lib/utils/status";
import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Queries,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { getReqUser } from "../auth/auth.helpers";
import NotificationService from "../notification/notification.service";
import { NotificationEvent } from "../notification/notification.types";
import { canMutatePost } from "./post.helpers";
import postSerializer from "./post.serializer";
import postService from "./post.service";
import {
  PostCreate,
  PostFetchList,
  Post as PostType,
  PostUpdate,
} from "./post.types";

@Route("posts")
@Tags("Post")
@Security("jwt")
export class PostController extends Controller {
  @Get("{postId}")
  public async fetch(@Path() postId: string): Promise<APIResponse<PostType>> {
    const post = await postService.fetch(postId);
    if (!post) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    return toResponse({ data: postSerializer.single(post) });
  }

  @Get("/")
  public async fetchList(
    @Queries()
    query: PostFetchList
  ): Promise<APIResponse<PaginationResponse<PostType>>> {
    const res = await postService.fetchList(query);
    return toResponse({
      data: postSerializer.paginated(res),
    });
  }

  @Post("/")
  public async create(
    @Body() body: PostCreate,
    @Request() req: ExReq
  ): Promise<APIResponse<PostType>> {
    const reqUser = getReqUser(req);

    const post = await postService.create({ ...body, author_id: reqUser.id });

    await NotificationService.trigger({
      type: NotificationEvent.NEW_POST,
      data: {
        author: post.author.name,
        title: post.title,
      },
    });

    this.setStatus(statusConst.created.code);
    return toResponse({ data: postSerializer.single(post) });
  }

  @Patch("{postId}")
  public async update(
    @Path() postId: string,
    @Body() body: PostUpdate,
    @Request() req: ExReq
  ): Promise<APIResponse<PostType>> {
    const reqUser = getReqUser(req);

    const existingPost = await postService.fetch(postId);
    if (!existingPost) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    if (!canMutatePost(reqUser, existingPost)) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({ error: statusConst.unAuthenticated.message });
    }

    const post = await postService.update(postId, body);
    return toResponse({ data: postSerializer.single(post) });
  }

  @Delete("{postId}")
  public async remove(
    @Path() postId: string,
    @Request() req: ExReq
  ): Promise<APIResponse<PostType>> {
    const reqUser = getReqUser(req);

    const existingPost = await postService.fetch(postId);
    if (!existingPost) {
      this.setStatus(statusConst.notFound.code);
      return toResponse({ error: statusConst.notFound.message });
    }

    if (!canMutatePost(reqUser, existingPost)) {
      this.setStatus(statusConst.unAuthenticated.code);
      return toResponse({ error: statusConst.unAuthenticated.message });
    }

    const post = await postService.remove(postId);
    return toResponse({ data: postSerializer.single(post) });
  }
}
