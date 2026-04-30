import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(request: Request) {

    const session = await getServerAuthSession();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { promptId, versionId, rendered_prompt, variables_input } = body;

    if (!promptId || !versionId) {
        return NextResponse.json({ error: "Missing promptId or versionId" }, { status: 400 });
    }

    const prompt = await prisma.prompts.findUnique({
        where: { id: promptId },
        include: {
            versions: {
                where: { id: versionId },
                include: {
                    promptVariables: true,
                },
            },
        },
    });

    if (!prompt) {
        return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    }

    if (prompt.versions.length === 0) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const version = prompt.versions[0];

    const result = await prisma.$transaction(async (tx) => {
        const run = await tx.prompt_run.create({
            data: {
                prompt_id: promptId,
                prompt_version_id: versionId,
                user_id: Number(session.user.id),
                rendered_prompt: rendered_prompt || "",
                variables_input: variables_input || {},
                status: "SUCCESS",
                token_used: 0,
                model: prompt.recommended_model ?? null,
            },
        });

        await tx.activity_log.create({
            data: {
                user_id: Number(session.user.id),
                action: "RUN_PROMPT",
                details: {
                    promptRunId: run.id,
                    promptId,
                    versionId,
                    promptTitle: prompt.title,
                    model: prompt.recommended_model ?? null,
                },
            },
        });

        return run;
    });

    return NextResponse.json(result);

}