/*
  Warnings:

  - A unique constraint covering the columns `[prompt_version_id,name]` on the table `Prompt_variables` will be added. If there are existing duplicate values, this will fail.
  - Made the column `prompt_version_id` on table `Prompt_variables` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'PUBLIC');

-- DropForeignKey
ALTER TABLE "Prompt_variables" DROP CONSTRAINT "Prompt_variables_prompt_version_id_fkey";

-- DropForeignKey
ALTER TABLE "Prompt_versions" DROP CONSTRAINT "Prompt_versions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Prompts" DROP CONSTRAINT "Prompts_owner_id_fkey";

-- DropIndex
DROP INDEX "Prompt_variables_prompt_id_name_key";

-- AlterTable
ALTER TABLE "Prompt_variables" ALTER COLUMN "prompt_version_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "Prompt_run" (
    "id" SERIAL NOT NULL,
    "prompt_id" INTEGER NOT NULL,
    "prompt_version_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rendered_prompt" TEXT NOT NULL,
    "variables_input" JSONB,
    "output_response" TEXT,
    "execution_time_ms" INTEGER,
    "token_used" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "model" VARCHAR(100),
    "status" VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prompt_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity_log" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" VARCHAR(255) NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prompt_variables_prompt_version_id_name_key" ON "Prompt_variables"("prompt_version_id", "name");

-- AddForeignKey
ALTER TABLE "Prompts" ADD CONSTRAINT "Prompts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_versions" ADD CONSTRAINT "Prompt_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_variables" ADD CONSTRAINT "Prompt_variables_prompt_version_id_fkey" FOREIGN KEY ("prompt_version_id") REFERENCES "Prompt_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_run" ADD CONSTRAINT "Prompt_run_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_run" ADD CONSTRAINT "Prompt_run_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "Prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prompt_run" ADD CONSTRAINT "Prompt_run_prompt_version_id_fkey" FOREIGN KEY ("prompt_version_id") REFERENCES "Prompt_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
