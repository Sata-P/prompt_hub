-- CreateTable
CREATE TABLE "Collections" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "visibility" VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collections_prompts" (
    "collection_id" INTEGER NOT NULL,
    "prompt_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Collections_prompts_pkey" PRIMARY KEY ("collection_id","prompt_id")
);

-- AddForeignKey
ALTER TABLE "Collections_prompts" ADD CONSTRAINT "Collections_prompts_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections_prompts" ADD CONSTRAINT "Collections_prompts_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "Prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
