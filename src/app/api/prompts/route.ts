import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { CreatePromptSchema } from "@/lib/validations/prompt";
import { z } from "zod";

/**
 * GET /api/prompts
 * List prompts with pagination, search, and filtering.
 *
 * Query params:
 *   page     - page number (default 1)
 *   limit    - items per page (default 20)
 *   q        - search in title/description
 *   status   - filter by status (DRAFT, REVIEW, PUBLISHED, ARCHIVED)
 *   categoryId - filter by category
 *   tag      - filter by tag name
 */
export async function GET(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status") || undefined;
    const categoryId = searchParams.get("categoryId")
      ? Number(searchParams.get("categoryId"))
      : undefined;
    const tag = searchParams.get("tag")?.trim() || undefined;
    const visibility = searchParams.get("visibility") || undefined;

    const userId = Number(session.user.id);
    const skip = (page - 1) * limit;

    // Build where clause
    const andConditions: any[] = [
      { deleted_at: null }, // Exclude soft-deleted
    ];

    const userRole = session.user.role;

    if (visibility === 'PUBLIC') {
      andConditions.push({ visibility: 'PUBLIC' });
    } else if (visibility === 'PRIVATE') {
      andConditions.push({ visibility: 'PRIVATE' });
      if (userRole === "ADMIN" || userRole === "EDITOR") {
        andConditions.push({ OR: [{ owner_id: userId }, { status: 'REVIEW' }] });
      } else {
        andConditions.push({ owner_id: userId });
      }
    } else {
      // By default show user's own prompts OR any public prompts
      const defaultOr: any[] = [
        { owner_id: userId },
        { visibility: 'PUBLIC' }
      ];
      if (userRole === "ADMIN" || userRole === "EDITOR") {
        defaultOr.push({ status: 'REVIEW' });
      }
      andConditions.push({ OR: defaultOr });
    }

    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (status) {
      andConditions.push({ status });
    }

    const model = searchParams.get("model")?.trim() || undefined;
    if (model) {
      andConditions.push({ recommended_model: model });
    }

    if (categoryId) {
      andConditions.push({ category_id: categoryId });
    }

    if (tag) {
      andConditions.push({
        tags: {
          some: {
            tag: { name: { equals: tag, mode: "insensitive" } },
          },
        },
      });
    }

    const where = { AND: andConditions };

    const [prompts, total] = await Promise.all([
      prisma.prompts.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updated_at: "desc" },
        include: {
          category: { select: { id: true, name: true, color: true } },
          owner: { select: { id: true, name: true, email: true } },
          tags: {
            include: {
              tag: { select: { id: true, name: true } },
            },
          },
          versions: {
            where: userRole === "VIEWER" ? { status: "PUBLISHED" } : {},
            orderBy: { version_no: "desc" },
            take: 1,
            select: {
              id: true,
              version_no: true,
              template_content: true,
              status: true,
              created_at: true,
            },
          },
        },
      }),
      prisma.prompts.count({ where }),
    ]);

    // Flatten tags for cleaner response
    const formatted = prompts.map((p) => ({
      ...p,
      tags: p.tags.map((pt) => pt.tag),
      latestVersion: p.versions[0] ?? null,
      versions: undefined,
    }));

    return NextResponse.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch prompts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts
 * Create a new prompt with its first version and variables in a single transaction.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = CreatePromptSchema.parse(body);
    const userId = Number(session.user.id);
    const userRole = session.user.role; // Extract role from session

    // --- RBAC & LIFECYCLE LOGIC ---
    // If admin or editor, auto-publish and make public
    // Otherwise, start as DRAFT and PRIVATE
    const isAdminOrEditor = userRole === "ADMIN" || userRole === "EDITOR";
    const initialStatus = isAdminOrEditor ? "PUBLISHED" : "DRAFT";
    const initialVisibility = isAdminOrEditor ? "PUBLIC" : "PRIVATE";
    // -------------------------------

    const result = await prisma.$transaction(async (tx) => {
      // 1. Resolve or create tags
      const tagRecords: { id: number }[] = [];
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          const tag = await tx.tags.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          });
          tagRecords.push({ id: tag.id });
        }
      }

      // 2. Create the prompt with enforced status and visibility
      const prompt = await tx.prompts.create({
        data: {
          title: data.title,
          description: data.description ?? null,
          category_id: data.categoryId ?? null,
          recommended_model: data.recommendedModel ?? null,
          visibility: initialVisibility, // Enforced here
          owner_id: userId,
          latest_version_no: 1,
          status: initialStatus, // Enforced here
          tags: {
            create: tagRecords.map((t) => ({
              tag_id: t.id,
            })),
          },
        },
      });

      // 3. Create the first version
      const version = await tx.prompt_versions.create({
        data: {
          prompt_id: prompt.id,
          version_no: 1,
          template_content: data.templateContent,
          system_prompt: data.systemPrompt ?? null,
          output_format: data.outputFormat ?? null,
          changelog: "Initial version",
          created_by: userId,
          status: initialStatus, // Match prompt status
        },
      });

      // 4. Create variables (linked to both prompt and version)
      if (data.variables && data.variables.length > 0) {
        await tx.prompt_variables.createMany({
          data: data.variables.map((v, i) => ({
            prompt_id: prompt.id,
            prompt_version_id: version.id,
            name: v.name,
            label: v.label,
            type: v.type,
            is_required: v.isRequired ?? false,
            default_value: v.defaultValue ?? null,
            placeholder: v.placeholder ?? null,
            description: v.description ?? null,
            options_json: v.optionsJson ?? null,
            sort_order: v.sortOrder ?? i,
          })),
        });
      }

      //activity log
        await tx.activity_log.create({
        data: {
          user_id: Number(session.user.id),
          action: "CREATE_PROMPT",
          details: { promptId: prompt.id,
                      name: prompt.title,
                      version: prompt.latest_version_no
                    },
        },
      });

      return { prompt, version };
    });

    // Fetch the full prompt with relations for the response
    const fullPrompt = await prisma.prompts.findUnique({
      where: { id: result.prompt.id },
      include: {
        category: { select: { id: true, name: true, color: true } },
        owner: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: { select: { id: true, name: true } } } },
        versions: {
          orderBy: { version_no: "desc" },
          include: { promptVariables: true },
        },
      },
    });

    return NextResponse.json(fullPrompt, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating prompt:", error);
    return NextResponse.json(
      { error: "Failed to create prompt" },
      { status: 500 }
    );
  }
}
