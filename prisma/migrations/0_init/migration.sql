-- CreateTable
CREATE TABLE "posts" (
    "title" TEXT NOT NULL,
    "labels" TEXT[],
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "views" INTEGER NOT NULL,
    "xata_id" TEXT NOT NULL DEFAULT ('rec_'::text || (xata_private.xid())::text),
    "xata_version" INTEGER NOT NULL DEFAULT 0,
    "xata_createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xata_updatedat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "xata_createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xata_updatedat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xata_id" TEXT NOT NULL DEFAULT ('rec_'::text || (xata_private.xid())::text),
    "xata_version" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "_pgroll_new_posts_xata_id_key" ON "posts"("xata_id");

-- CreateIndex
CREATE UNIQUE INDEX "_pgroll_new_users_xata_id_key" ON "users"("xata_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "fk_users" FOREIGN KEY ("author") REFERENCES "users"("xata_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

