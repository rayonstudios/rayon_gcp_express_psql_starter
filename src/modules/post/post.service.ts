import { slugify } from "#/src/lib/utils";
import { paginatedSortQuery } from "#/src/lib/utils/pagination";
import { prisma } from "#/src/lib/utils/prisma";
import { withSearch } from "#/src/lib/utils/search";
import { PostCreate, PostFetchList, PostRaw, PostUpdate } from "./post.types";

async function fetch(id: string) {
  const post = await prisma.posts.findUnique({
    where: { id },
    include: { author: true },
  });
  return post;
}

async function fetchList(filters?: PostFetchList) {
  let query: Parameters<typeof prisma.posts.findMany>[0] = {};

  if (filters?.populate) {
    query.include = {
      author: true,
    };
  }

  if (filters?.author_id) {
    query.where = {
      author_id: filters.author_id,
    };
  }

  if (filters?.labels) {
    query.where = {
      ...query.where,
      labels: {
        hasSome: filters.labels,
      },
    };
  }

  if (filters?.initial_created_at) {
    query.where = {
      ...query.where,
      created_at: {
        gte: filters.initial_created_at,
      },
    };
  }

  if (filters?.final_created_at) {
    query.where = {
      ...query.where,
      created_at: {
        ...((query.where?.created_at ?? {}) as object),
        lte: filters.final_created_at,
      },
    };
  }

  if (filters?.search)
    query = withSearch(query, ["author.name", "title", "text"], filters.search);

  const res = await paginatedSortQuery<PostRaw>("posts", query, filters);
  return res;
}

async function create(data: PostCreate & { author_id: string }) {
  const post = await prisma.posts.create({
    data: {
      ...data,
      labels: data.labels || [],
      slug: slugify(data.title),
      views: 0,
    },
    include: { author: true },
  });
  return post;
}

async function update(id: string, data: PostUpdate) {
  const post = await prisma.posts.update({
    where: { id },
    data,
    include: { author: true },
  });
  return post;
}

async function remove(id: string) {
  const post = await prisma.posts.delete({
    where: { id },
    include: { author: true },
  });
  return post;
}

const postService = {
  fetch,
  fetchList,
  create,
  update,
  remove,
};

export default postService;
