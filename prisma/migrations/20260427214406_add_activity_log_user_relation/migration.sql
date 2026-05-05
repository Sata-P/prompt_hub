-- AlterTable
ALTER TABLE "Activity_log" ALTER COLUMN "details" SET DATA TYPE JSON;

-- AddForeignKey
ALTER TABLE "Activity_log" ADD CONSTRAINT "Activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
