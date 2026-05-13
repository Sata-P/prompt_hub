import { z } from 'zod';
import { Prisma } from '@prisma/client';

/////////////////////////////////////////
// HELPER FUNCTIONS
/////////////////////////////////////////

// JSON
//------------------------------------------------------

export type NullableJsonInput = Prisma.JsonValue | null | 'JsonNull' | 'DbNull' | Prisma.NullTypes.DbNull | Prisma.NullTypes.JsonNull;

export const transformJsonNull = (v?: NullableJsonInput) => {
  if (!v || v === 'DbNull') return Prisma.NullTypes.DbNull;
  if (v === 'JsonNull') return Prisma.NullTypes.JsonNull;
  return v;
};

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.literal(null),
    z.record(z.string(), z.lazy(() => JsonValueSchema.optional())),
    z.array(z.lazy(() => JsonValueSchema)),
  ])
);

export type JsonValueType = z.infer<typeof JsonValueSchema>;

export const NullableJsonValue = z
  .union([JsonValueSchema, z.literal('DbNull'), z.literal('JsonNull')])
  .nullable()
  .transform((v) => transformJsonNull(v));

export type NullableJsonValueType = z.infer<typeof NullableJsonValue>;

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.object({ toJSON: z.any() }),
    z.record(z.string(), z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([InputJsonValueSchema, z.literal(null)]))),
  ])
);

export type InputJsonValueType = z.infer<typeof InputJsonValueSchema>;


/////////////////////////////////////////
// ENUMS
/////////////////////////////////////////

export const TransactionIsolationLevelSchema = z.enum(['ReadUncommitted','ReadCommitted','RepeatableRead','Serializable']);

export const UsersScalarFieldEnumSchema = z.enum(['id','name','email','password','role','created_at','updated_at','status']);

export const CategoriesScalarFieldEnumSchema = z.enum(['id','name','color','created_at','updated_at']);

export const PromptsScalarFieldEnumSchema = z.enum(['id','title','description','status','visibility','latest_version_no','recommended_model','is_template_active','created_at','updated_at','deleted_at','category_id','owner_id']);

export const TagsScalarFieldEnumSchema = z.enum(['id','name','created_at']);

export const Prompt_versionsScalarFieldEnumSchema = z.enum(['id','version_no','template_content','system_prompt','output_format','changelog','created_at','status','prompt_id','created_by']);

export const Prompt_variablesScalarFieldEnumSchema = z.enum(['id','name','label','type','is_required','default_value','placeholder','description','options_json','sort_order','created_at','updated_at','prompt_id','prompt_version_id']);

export const Prompt_tagsScalarFieldEnumSchema = z.enum(['prompt_id','tag_id']);

export const CollectionsScalarFieldEnumSchema = z.enum(['id','name','description','visibility','created_at','updated_at']);

export const Collections_promptsScalarFieldEnumSchema = z.enum(['collection_id','prompt_id','sort_order']);

export const FavoritesScalarFieldEnumSchema = z.enum(['id','user_id','prompt_id','created_at','updated_at']);

export const Prompt_runScalarFieldEnumSchema = z.enum(['id','prompt_id','prompt_version_id','user_id','rendered_prompt','variables_input','output_response','execution_time_ms','token_used','model','status','error_message','created_at','updated_at']);

export const Activity_logScalarFieldEnumSchema = z.enum(['id','user_id','action','details','created_at']);

export const Prompt_commentsScalarFieldEnumSchema = z.enum(['id','content','attachment_url','prompt_id','user_id','parent_id','created_at','updated_at']);

export const SortOrderSchema = z.enum(['asc','desc']);

export const NullableJsonNullValueInputSchema: z.ZodType<Prisma.NullableJsonNullValueInput> = z.enum(['DbNull','JsonNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value);

export const QueryModeSchema = z.enum(['default','insensitive']);

export const NullsOrderSchema = z.enum(['first','last']);

export const JsonNullValueFilterSchema: z.ZodType<Prisma.JsonNullValueFilter> = z.enum(['DbNull','JsonNull','AnyNull',]).transform((value) => value === 'JsonNull' ? Prisma.JsonNull : value === 'DbNull' ? Prisma.DbNull : value === 'AnyNull' ? Prisma.AnyNull : value);

export const RoleSchema = z.enum(['VIEWER','EDITOR','ADMIN']);

export type RoleType = `${z.infer<typeof RoleSchema>}`

export const StatusSchema = z.enum(['DRAFT','PUBLISHED','ARCHIVED','REJECTED','REVIEW']);

export type StatusType = `${z.infer<typeof StatusSchema>}`

export const VisibilitySchema = z.enum(['PRIVATE','PUBLIC']);

export type VisibilityType = `${z.infer<typeof VisibilitySchema>}`

export const UserStatusSchema = z.enum(['ACTIVATED','DEACTIVATED']);

export type UserStatusType = `${z.infer<typeof UserStatusSchema>}`

/////////////////////////////////////////
// MODELS
/////////////////////////////////////////

/////////////////////////////////////////
// USERS SCHEMA
/////////////////////////////////////////

export const UsersSchema = z.object({
  status: UserStatusSchema,
  id: z.number().int(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Users = z.infer<typeof UsersSchema>

// USERS RELATION SCHEMA
//------------------------------------------------------

export type UsersRelations = {
  prompts: PromptsWithRelations[];
  created_versions: Prompt_versionsWithRelations[];
  favorites: FavoritesWithRelations[];
  promptRuns: Prompt_runWithRelations[];
  activityLogs: Activity_logWithRelations[];
  comments: Prompt_commentsWithRelations[];
};

export type UsersWithRelations = z.infer<typeof UsersSchema> & UsersRelations

export const UsersWithRelationsSchema: z.ZodType<UsersWithRelations> = UsersSchema.merge(z.object({
  prompts: z.lazy(() => PromptsWithRelationsSchema).array(),
  created_versions: z.lazy(() => Prompt_versionsWithRelationsSchema).array(),
  favorites: z.lazy(() => FavoritesWithRelationsSchema).array(),
  promptRuns: z.lazy(() => Prompt_runWithRelationsSchema).array(),
  activityLogs: z.lazy(() => Activity_logWithRelationsSchema).array(),
  comments: z.lazy(() => Prompt_commentsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// CATEGORIES SCHEMA
/////////////////////////////////////////

export const CategoriesSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  color: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Categories = z.infer<typeof CategoriesSchema>

// CATEGORIES RELATION SCHEMA
//------------------------------------------------------

export type CategoriesRelations = {
  prompts: PromptsWithRelations[];
};

export type CategoriesWithRelations = z.infer<typeof CategoriesSchema> & CategoriesRelations

export const CategoriesWithRelationsSchema: z.ZodType<CategoriesWithRelations> = CategoriesSchema.merge(z.object({
  prompts: z.lazy(() => PromptsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// PROMPTS SCHEMA
/////////////////////////////////////////

export const PromptsSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  visibility: z.string(),
  latest_version_no: z.number().int(),
  recommended_model: z.string().nullable(),
  is_template_active: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  deleted_at: z.coerce.date().nullable(),
  category_id: z.number().int().nullable(),
  owner_id: z.number().int(),
})

export type Prompts = z.infer<typeof PromptsSchema>

// PROMPTS RELATION SCHEMA
//------------------------------------------------------

export type PromptsRelations = {
  category?: CategoriesWithRelations | null;
  owner: UsersWithRelations;
  versions: Prompt_versionsWithRelations[];
  variables: Prompt_variablesWithRelations[];
  tags: Prompt_tagsWithRelations[];
  collections: Collections_promptsWithRelations[];
  favorites: FavoritesWithRelations[];
  promptRuns: Prompt_runWithRelations[];
  comments: Prompt_commentsWithRelations[];
};

export type PromptsWithRelations = z.infer<typeof PromptsSchema> & PromptsRelations

export const PromptsWithRelationsSchema: z.ZodType<PromptsWithRelations> = PromptsSchema.merge(z.object({
  category: z.lazy(() => CategoriesWithRelationsSchema).nullable(),
  owner: z.lazy(() => UsersWithRelationsSchema),
  versions: z.lazy(() => Prompt_versionsWithRelationsSchema).array(),
  variables: z.lazy(() => Prompt_variablesWithRelationsSchema).array(),
  tags: z.lazy(() => Prompt_tagsWithRelationsSchema).array(),
  collections: z.lazy(() => Collections_promptsWithRelationsSchema).array(),
  favorites: z.lazy(() => FavoritesWithRelationsSchema).array(),
  promptRuns: z.lazy(() => Prompt_runWithRelationsSchema).array(),
  comments: z.lazy(() => Prompt_commentsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// TAGS SCHEMA
/////////////////////////////////////////

export const TagsSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  created_at: z.coerce.date(),
})

export type Tags = z.infer<typeof TagsSchema>

// TAGS RELATION SCHEMA
//------------------------------------------------------

export type TagsRelations = {
  prompts: Prompt_tagsWithRelations[];
};

export type TagsWithRelations = z.infer<typeof TagsSchema> & TagsRelations

export const TagsWithRelationsSchema: z.ZodType<TagsWithRelations> = TagsSchema.merge(z.object({
  prompts: z.lazy(() => Prompt_tagsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// PROMPT VERSIONS SCHEMA
/////////////////////////////////////////

export const Prompt_versionsSchema = z.object({
  id: z.number().int(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().nullable(),
  output_format: z.string().nullable(),
  changelog: z.string().nullable(),
  created_at: z.coerce.date(),
  status: z.string(),
  prompt_id: z.number().int(),
  created_by: z.number().int(),
})

export type Prompt_versions = z.infer<typeof Prompt_versionsSchema>

// PROMPT VERSIONS RELATION SCHEMA
//------------------------------------------------------

export type Prompt_versionsRelations = {
  prompt: PromptsWithRelations;
  creator: UsersWithRelations;
  promptVariables: Prompt_variablesWithRelations[];
  promptRuns: Prompt_runWithRelations[];
};

export type Prompt_versionsWithRelations = z.infer<typeof Prompt_versionsSchema> & Prompt_versionsRelations

export const Prompt_versionsWithRelationsSchema: z.ZodType<Prompt_versionsWithRelations> = Prompt_versionsSchema.merge(z.object({
  prompt: z.lazy(() => PromptsWithRelationsSchema),
  creator: z.lazy(() => UsersWithRelationsSchema),
  promptVariables: z.lazy(() => Prompt_variablesWithRelationsSchema).array(),
  promptRuns: z.lazy(() => Prompt_runWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// PROMPT VARIABLES SCHEMA
/////////////////////////////////////////

export const Prompt_variablesSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean(),
  default_value: z.string().nullable(),
  placeholder: z.string().nullable(),
  description: z.string().nullable(),
  options_json: JsonValueSchema.nullable(),
  sort_order: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
})

export type Prompt_variables = z.infer<typeof Prompt_variablesSchema>

// PROMPT VARIABLES RELATION SCHEMA
//------------------------------------------------------

export type Prompt_variablesRelations = {
  prompt: PromptsWithRelations;
  prompt_version?: Prompt_versionsWithRelations | null;
};

export type Prompt_variablesWithRelations = Omit<z.infer<typeof Prompt_variablesSchema>, "options_json"> & {
  options_json?: JsonValueType | null;
} & Prompt_variablesRelations

export const Prompt_variablesWithRelationsSchema: z.ZodType<Prompt_variablesWithRelations> = Prompt_variablesSchema.merge(z.object({
  prompt: z.lazy(() => PromptsWithRelationsSchema),
  prompt_version: z.lazy(() => Prompt_versionsWithRelationsSchema).nullable(),
}))

/////////////////////////////////////////
// PROMPT TAGS SCHEMA
/////////////////////////////////////////

export const Prompt_tagsSchema = z.object({
  prompt_id: z.number().int(),
  tag_id: z.number().int(),
})

export type Prompt_tags = z.infer<typeof Prompt_tagsSchema>

// PROMPT TAGS RELATION SCHEMA
//------------------------------------------------------

export type Prompt_tagsRelations = {
  prompt: PromptsWithRelations;
  tag: TagsWithRelations;
};

export type Prompt_tagsWithRelations = z.infer<typeof Prompt_tagsSchema> & Prompt_tagsRelations

export const Prompt_tagsWithRelationsSchema: z.ZodType<Prompt_tagsWithRelations> = Prompt_tagsSchema.merge(z.object({
  prompt: z.lazy(() => PromptsWithRelationsSchema),
  tag: z.lazy(() => TagsWithRelationsSchema),
}))

/////////////////////////////////////////
// COLLECTIONS SCHEMA
/////////////////////////////////////////

export const CollectionsSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  visibility: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Collections = z.infer<typeof CollectionsSchema>

// COLLECTIONS RELATION SCHEMA
//------------------------------------------------------

export type CollectionsRelations = {
  prompts: Collections_promptsWithRelations[];
};

export type CollectionsWithRelations = z.infer<typeof CollectionsSchema> & CollectionsRelations

export const CollectionsWithRelationsSchema: z.ZodType<CollectionsWithRelations> = CollectionsSchema.merge(z.object({
  prompts: z.lazy(() => Collections_promptsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// COLLECTIONS PROMPTS SCHEMA
/////////////////////////////////////////

export const Collections_promptsSchema = z.object({
  collection_id: z.number().int(),
  prompt_id: z.number().int(),
  sort_order: z.number().int(),
})

export type Collections_prompts = z.infer<typeof Collections_promptsSchema>

// COLLECTIONS PROMPTS RELATION SCHEMA
//------------------------------------------------------

export type Collections_promptsRelations = {
  collection: CollectionsWithRelations;
  prompt: PromptsWithRelations;
};

export type Collections_promptsWithRelations = z.infer<typeof Collections_promptsSchema> & Collections_promptsRelations

export const Collections_promptsWithRelationsSchema: z.ZodType<Collections_promptsWithRelations> = Collections_promptsSchema.merge(z.object({
  collection: z.lazy(() => CollectionsWithRelationsSchema),
  prompt: z.lazy(() => PromptsWithRelationsSchema),
}))

/////////////////////////////////////////
// FAVORITES SCHEMA
/////////////////////////////////////////

export const FavoritesSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  prompt_id: z.number().int(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Favorites = z.infer<typeof FavoritesSchema>

// FAVORITES RELATION SCHEMA
//------------------------------------------------------

export type FavoritesRelations = {
  user: UsersWithRelations;
  prompt: PromptsWithRelations;
};

export type FavoritesWithRelations = z.infer<typeof FavoritesSchema> & FavoritesRelations

export const FavoritesWithRelationsSchema: z.ZodType<FavoritesWithRelations> = FavoritesSchema.merge(z.object({
  user: z.lazy(() => UsersWithRelationsSchema),
  prompt: z.lazy(() => PromptsWithRelationsSchema),
}))

/////////////////////////////////////////
// PROMPT RUN SCHEMA
/////////////////////////////////////////

export const Prompt_runSchema = z.object({
  id: z.number().int(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: JsonValueSchema.nullable(),
  output_response: z.string().nullable(),
  execution_time_ms: z.number().int().nullable(),
  token_used: z.number(),
  model: z.string().nullable(),
  status: z.string(),
  error_message: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Prompt_run = z.infer<typeof Prompt_runSchema>

// PROMPT RUN RELATION SCHEMA
//------------------------------------------------------

export type Prompt_runRelations = {
  user: UsersWithRelations;
  prompt: PromptsWithRelations;
  prompt_version: Prompt_versionsWithRelations;
};

export type Prompt_runWithRelations = Omit<z.infer<typeof Prompt_runSchema>, "variables_input"> & {
  variables_input?: JsonValueType | null;
} & Prompt_runRelations

export const Prompt_runWithRelationsSchema: z.ZodType<Prompt_runWithRelations> = Prompt_runSchema.merge(z.object({
  user: z.lazy(() => UsersWithRelationsSchema),
  prompt: z.lazy(() => PromptsWithRelationsSchema),
  prompt_version: z.lazy(() => Prompt_versionsWithRelationsSchema),
}))

/////////////////////////////////////////
// ACTIVITY LOG SCHEMA
/////////////////////////////////////////

export const Activity_logSchema = z.object({
  id: z.number().int(),
  user_id: z.number().int(),
  action: z.string(),
  details: JsonValueSchema.nullable(),
  created_at: z.coerce.date(),
})

export type Activity_log = z.infer<typeof Activity_logSchema>

// ACTIVITY LOG RELATION SCHEMA
//------------------------------------------------------

export type Activity_logRelations = {
  user: UsersWithRelations;
};

export type Activity_logWithRelations = Omit<z.infer<typeof Activity_logSchema>, "details"> & {
  details?: JsonValueType | null;
} & Activity_logRelations

export const Activity_logWithRelationsSchema: z.ZodType<Activity_logWithRelations> = Activity_logSchema.merge(z.object({
  user: z.lazy(() => UsersWithRelationsSchema),
}))

/////////////////////////////////////////
// PROMPT COMMENTS SCHEMA
/////////////////////////////////////////

export const Prompt_commentsSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  attachment_url: z.string().nullable(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  parent_id: z.number().int().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Prompt_comments = z.infer<typeof Prompt_commentsSchema>

// PROMPT COMMENTS RELATION SCHEMA
//------------------------------------------------------

export type Prompt_commentsRelations = {
  prompt: PromptsWithRelations;
  user: UsersWithRelations;
  parent?: Prompt_commentsWithRelations | null;
  replies: Prompt_commentsWithRelations[];
};

export type Prompt_commentsWithRelations = z.infer<typeof Prompt_commentsSchema> & Prompt_commentsRelations

export const Prompt_commentsWithRelationsSchema: z.ZodType<Prompt_commentsWithRelations> = Prompt_commentsSchema.merge(z.object({
  prompt: z.lazy(() => PromptsWithRelationsSchema),
  user: z.lazy(() => UsersWithRelationsSchema),
  parent: z.lazy(() => Prompt_commentsWithRelationsSchema).nullable(),
  replies: z.lazy(() => Prompt_commentsWithRelationsSchema).array(),
}))

/////////////////////////////////////////
// SELECT & INCLUDE
/////////////////////////////////////////

// USERS
//------------------------------------------------------

export const UsersIncludeSchema: z.ZodType<Prisma.UsersInclude> = z.object({
  prompts: z.union([z.boolean(),z.lazy(() => PromptsFindManyArgsSchema)]).optional(),
  created_versions: z.union([z.boolean(),z.lazy(() => Prompt_versionsFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoritesFindManyArgsSchema)]).optional(),
  promptRuns: z.union([z.boolean(),z.lazy(() => Prompt_runFindManyArgsSchema)]).optional(),
  activityLogs: z.union([z.boolean(),z.lazy(() => Activity_logFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => Prompt_commentsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const UsersArgsSchema: z.ZodType<Prisma.UsersDefaultArgs> = z.object({
  select: z.lazy(() => UsersSelectSchema).optional(),
  include: z.lazy(() => UsersIncludeSchema).optional(),
}).strict();

export const UsersCountOutputTypeArgsSchema: z.ZodType<Prisma.UsersCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => UsersCountOutputTypeSelectSchema).nullish(),
}).strict();

export const UsersCountOutputTypeSelectSchema: z.ZodType<Prisma.UsersCountOutputTypeSelect> = z.object({
  prompts: z.boolean().optional(),
  created_versions: z.boolean().optional(),
  favorites: z.boolean().optional(),
  promptRuns: z.boolean().optional(),
  activityLogs: z.boolean().optional(),
  comments: z.boolean().optional(),
}).strict();

export const UsersSelectSchema: z.ZodType<Prisma.UsersSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  email: z.boolean().optional(),
  password: z.boolean().optional(),
  role: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  status: z.boolean().optional(),
  prompts: z.union([z.boolean(),z.lazy(() => PromptsFindManyArgsSchema)]).optional(),
  created_versions: z.union([z.boolean(),z.lazy(() => Prompt_versionsFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoritesFindManyArgsSchema)]).optional(),
  promptRuns: z.union([z.boolean(),z.lazy(() => Prompt_runFindManyArgsSchema)]).optional(),
  activityLogs: z.union([z.boolean(),z.lazy(() => Activity_logFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => Prompt_commentsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => UsersCountOutputTypeArgsSchema)]).optional(),
}).strict()

// CATEGORIES
//------------------------------------------------------

export const CategoriesIncludeSchema: z.ZodType<Prisma.CategoriesInclude> = z.object({
  prompts: z.union([z.boolean(),z.lazy(() => PromptsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoriesCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const CategoriesArgsSchema: z.ZodType<Prisma.CategoriesDefaultArgs> = z.object({
  select: z.lazy(() => CategoriesSelectSchema).optional(),
  include: z.lazy(() => CategoriesIncludeSchema).optional(),
}).strict();

export const CategoriesCountOutputTypeArgsSchema: z.ZodType<Prisma.CategoriesCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CategoriesCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CategoriesCountOutputTypeSelectSchema: z.ZodType<Prisma.CategoriesCountOutputTypeSelect> = z.object({
  prompts: z.boolean().optional(),
}).strict();

export const CategoriesSelectSchema: z.ZodType<Prisma.CategoriesSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  color: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  prompts: z.union([z.boolean(),z.lazy(() => PromptsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CategoriesCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PROMPTS
//------------------------------------------------------

export const PromptsIncludeSchema: z.ZodType<Prisma.PromptsInclude> = z.object({
  category: z.union([z.boolean(),z.lazy(() => CategoriesArgsSchema)]).optional(),
  owner: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  versions: z.union([z.boolean(),z.lazy(() => Prompt_versionsFindManyArgsSchema)]).optional(),
  variables: z.union([z.boolean(),z.lazy(() => Prompt_variablesFindManyArgsSchema)]).optional(),
  tags: z.union([z.boolean(),z.lazy(() => Prompt_tagsFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => Collections_promptsFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoritesFindManyArgsSchema)]).optional(),
  promptRuns: z.union([z.boolean(),z.lazy(() => Prompt_runFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => Prompt_commentsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => PromptsCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const PromptsArgsSchema: z.ZodType<Prisma.PromptsDefaultArgs> = z.object({
  select: z.lazy(() => PromptsSelectSchema).optional(),
  include: z.lazy(() => PromptsIncludeSchema).optional(),
}).strict();

export const PromptsCountOutputTypeArgsSchema: z.ZodType<Prisma.PromptsCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => PromptsCountOutputTypeSelectSchema).nullish(),
}).strict();

export const PromptsCountOutputTypeSelectSchema: z.ZodType<Prisma.PromptsCountOutputTypeSelect> = z.object({
  versions: z.boolean().optional(),
  variables: z.boolean().optional(),
  tags: z.boolean().optional(),
  collections: z.boolean().optional(),
  favorites: z.boolean().optional(),
  promptRuns: z.boolean().optional(),
  comments: z.boolean().optional(),
}).strict();

export const PromptsSelectSchema: z.ZodType<Prisma.PromptsSelect> = z.object({
  id: z.boolean().optional(),
  title: z.boolean().optional(),
  description: z.boolean().optional(),
  status: z.boolean().optional(),
  visibility: z.boolean().optional(),
  latest_version_no: z.boolean().optional(),
  recommended_model: z.boolean().optional(),
  is_template_active: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  deleted_at: z.boolean().optional(),
  category_id: z.boolean().optional(),
  owner_id: z.boolean().optional(),
  category: z.union([z.boolean(),z.lazy(() => CategoriesArgsSchema)]).optional(),
  owner: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  versions: z.union([z.boolean(),z.lazy(() => Prompt_versionsFindManyArgsSchema)]).optional(),
  variables: z.union([z.boolean(),z.lazy(() => Prompt_variablesFindManyArgsSchema)]).optional(),
  tags: z.union([z.boolean(),z.lazy(() => Prompt_tagsFindManyArgsSchema)]).optional(),
  collections: z.union([z.boolean(),z.lazy(() => Collections_promptsFindManyArgsSchema)]).optional(),
  favorites: z.union([z.boolean(),z.lazy(() => FavoritesFindManyArgsSchema)]).optional(),
  promptRuns: z.union([z.boolean(),z.lazy(() => Prompt_runFindManyArgsSchema)]).optional(),
  comments: z.union([z.boolean(),z.lazy(() => Prompt_commentsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => PromptsCountOutputTypeArgsSchema)]).optional(),
}).strict()

// TAGS
//------------------------------------------------------

export const TagsIncludeSchema: z.ZodType<Prisma.TagsInclude> = z.object({
  prompts: z.union([z.boolean(),z.lazy(() => Prompt_tagsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TagsCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const TagsArgsSchema: z.ZodType<Prisma.TagsDefaultArgs> = z.object({
  select: z.lazy(() => TagsSelectSchema).optional(),
  include: z.lazy(() => TagsIncludeSchema).optional(),
}).strict();

export const TagsCountOutputTypeArgsSchema: z.ZodType<Prisma.TagsCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TagsCountOutputTypeSelectSchema).nullish(),
}).strict();

export const TagsCountOutputTypeSelectSchema: z.ZodType<Prisma.TagsCountOutputTypeSelect> = z.object({
  prompts: z.boolean().optional(),
}).strict();

export const TagsSelectSchema: z.ZodType<Prisma.TagsSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  created_at: z.boolean().optional(),
  prompts: z.union([z.boolean(),z.lazy(() => Prompt_tagsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TagsCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PROMPT VERSIONS
//------------------------------------------------------

export const Prompt_versionsIncludeSchema: z.ZodType<Prisma.Prompt_versionsInclude> = z.object({
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  creator: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  promptVariables: z.union([z.boolean(),z.lazy(() => Prompt_variablesFindManyArgsSchema)]).optional(),
  promptRuns: z.union([z.boolean(),z.lazy(() => Prompt_runFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => Prompt_versionsCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const Prompt_versionsArgsSchema: z.ZodType<Prisma.Prompt_versionsDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_versionsSelectSchema).optional(),
  include: z.lazy(() => Prompt_versionsIncludeSchema).optional(),
}).strict();

export const Prompt_versionsCountOutputTypeArgsSchema: z.ZodType<Prisma.Prompt_versionsCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_versionsCountOutputTypeSelectSchema).nullish(),
}).strict();

export const Prompt_versionsCountOutputTypeSelectSchema: z.ZodType<Prisma.Prompt_versionsCountOutputTypeSelect> = z.object({
  promptVariables: z.boolean().optional(),
  promptRuns: z.boolean().optional(),
}).strict();

export const Prompt_versionsSelectSchema: z.ZodType<Prisma.Prompt_versionsSelect> = z.object({
  id: z.boolean().optional(),
  version_no: z.boolean().optional(),
  template_content: z.boolean().optional(),
  system_prompt: z.boolean().optional(),
  output_format: z.boolean().optional(),
  changelog: z.boolean().optional(),
  created_at: z.boolean().optional(),
  status: z.boolean().optional(),
  prompt_id: z.boolean().optional(),
  created_by: z.boolean().optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  creator: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  promptVariables: z.union([z.boolean(),z.lazy(() => Prompt_variablesFindManyArgsSchema)]).optional(),
  promptRuns: z.union([z.boolean(),z.lazy(() => Prompt_runFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => Prompt_versionsCountOutputTypeArgsSchema)]).optional(),
}).strict()

// PROMPT VARIABLES
//------------------------------------------------------

export const Prompt_variablesIncludeSchema: z.ZodType<Prisma.Prompt_variablesInclude> = z.object({
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  prompt_version: z.union([z.boolean(),z.lazy(() => Prompt_versionsArgsSchema)]).optional(),
}).strict();

export const Prompt_variablesArgsSchema: z.ZodType<Prisma.Prompt_variablesDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_variablesSelectSchema).optional(),
  include: z.lazy(() => Prompt_variablesIncludeSchema).optional(),
}).strict();

export const Prompt_variablesSelectSchema: z.ZodType<Prisma.Prompt_variablesSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  label: z.boolean().optional(),
  type: z.boolean().optional(),
  is_required: z.boolean().optional(),
  default_value: z.boolean().optional(),
  placeholder: z.boolean().optional(),
  description: z.boolean().optional(),
  options_json: z.boolean().optional(),
  sort_order: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  prompt_id: z.boolean().optional(),
  prompt_version_id: z.boolean().optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  prompt_version: z.union([z.boolean(),z.lazy(() => Prompt_versionsArgsSchema)]).optional(),
}).strict()

// PROMPT TAGS
//------------------------------------------------------

export const Prompt_tagsIncludeSchema: z.ZodType<Prisma.Prompt_tagsInclude> = z.object({
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  tag: z.union([z.boolean(),z.lazy(() => TagsArgsSchema)]).optional(),
}).strict();

export const Prompt_tagsArgsSchema: z.ZodType<Prisma.Prompt_tagsDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_tagsSelectSchema).optional(),
  include: z.lazy(() => Prompt_tagsIncludeSchema).optional(),
}).strict();

export const Prompt_tagsSelectSchema: z.ZodType<Prisma.Prompt_tagsSelect> = z.object({
  prompt_id: z.boolean().optional(),
  tag_id: z.boolean().optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  tag: z.union([z.boolean(),z.lazy(() => TagsArgsSchema)]).optional(),
}).strict()

// COLLECTIONS
//------------------------------------------------------

export const CollectionsIncludeSchema: z.ZodType<Prisma.CollectionsInclude> = z.object({
  prompts: z.union([z.boolean(),z.lazy(() => Collections_promptsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CollectionsCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const CollectionsArgsSchema: z.ZodType<Prisma.CollectionsDefaultArgs> = z.object({
  select: z.lazy(() => CollectionsSelectSchema).optional(),
  include: z.lazy(() => CollectionsIncludeSchema).optional(),
}).strict();

export const CollectionsCountOutputTypeArgsSchema: z.ZodType<Prisma.CollectionsCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CollectionsCountOutputTypeSelectSchema).nullish(),
}).strict();

export const CollectionsCountOutputTypeSelectSchema: z.ZodType<Prisma.CollectionsCountOutputTypeSelect> = z.object({
  prompts: z.boolean().optional(),
}).strict();

export const CollectionsSelectSchema: z.ZodType<Prisma.CollectionsSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  visibility: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  prompts: z.union([z.boolean(),z.lazy(() => Collections_promptsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => CollectionsCountOutputTypeArgsSchema)]).optional(),
}).strict()

// COLLECTIONS PROMPTS
//------------------------------------------------------

export const Collections_promptsIncludeSchema: z.ZodType<Prisma.Collections_promptsInclude> = z.object({
  collection: z.union([z.boolean(),z.lazy(() => CollectionsArgsSchema)]).optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
}).strict();

export const Collections_promptsArgsSchema: z.ZodType<Prisma.Collections_promptsDefaultArgs> = z.object({
  select: z.lazy(() => Collections_promptsSelectSchema).optional(),
  include: z.lazy(() => Collections_promptsIncludeSchema).optional(),
}).strict();

export const Collections_promptsSelectSchema: z.ZodType<Prisma.Collections_promptsSelect> = z.object({
  collection_id: z.boolean().optional(),
  prompt_id: z.boolean().optional(),
  sort_order: z.boolean().optional(),
  collection: z.union([z.boolean(),z.lazy(() => CollectionsArgsSchema)]).optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
}).strict()

// FAVORITES
//------------------------------------------------------

export const FavoritesIncludeSchema: z.ZodType<Prisma.FavoritesInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
}).strict();

export const FavoritesArgsSchema: z.ZodType<Prisma.FavoritesDefaultArgs> = z.object({
  select: z.lazy(() => FavoritesSelectSchema).optional(),
  include: z.lazy(() => FavoritesIncludeSchema).optional(),
}).strict();

export const FavoritesSelectSchema: z.ZodType<Prisma.FavoritesSelect> = z.object({
  id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  prompt_id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
}).strict()

// PROMPT RUN
//------------------------------------------------------

export const Prompt_runIncludeSchema: z.ZodType<Prisma.Prompt_runInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  prompt_version: z.union([z.boolean(),z.lazy(() => Prompt_versionsArgsSchema)]).optional(),
}).strict();

export const Prompt_runArgsSchema: z.ZodType<Prisma.Prompt_runDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_runSelectSchema).optional(),
  include: z.lazy(() => Prompt_runIncludeSchema).optional(),
}).strict();

export const Prompt_runSelectSchema: z.ZodType<Prisma.Prompt_runSelect> = z.object({
  id: z.boolean().optional(),
  prompt_id: z.boolean().optional(),
  prompt_version_id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  rendered_prompt: z.boolean().optional(),
  variables_input: z.boolean().optional(),
  output_response: z.boolean().optional(),
  execution_time_ms: z.boolean().optional(),
  token_used: z.boolean().optional(),
  model: z.boolean().optional(),
  status: z.boolean().optional(),
  error_message: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  prompt_version: z.union([z.boolean(),z.lazy(() => Prompt_versionsArgsSchema)]).optional(),
}).strict()

// ACTIVITY LOG
//------------------------------------------------------

export const Activity_logIncludeSchema: z.ZodType<Prisma.Activity_logInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
}).strict();

export const Activity_logArgsSchema: z.ZodType<Prisma.Activity_logDefaultArgs> = z.object({
  select: z.lazy(() => Activity_logSelectSchema).optional(),
  include: z.lazy(() => Activity_logIncludeSchema).optional(),
}).strict();

export const Activity_logSelectSchema: z.ZodType<Prisma.Activity_logSelect> = z.object({
  id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  action: z.boolean().optional(),
  details: z.boolean().optional(),
  created_at: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
}).strict()

// PROMPT COMMENTS
//------------------------------------------------------

export const Prompt_commentsIncludeSchema: z.ZodType<Prisma.Prompt_commentsInclude> = z.object({
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  parent: z.union([z.boolean(),z.lazy(() => Prompt_commentsArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => Prompt_commentsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => Prompt_commentsCountOutputTypeArgsSchema)]).optional(),
}).strict();

export const Prompt_commentsArgsSchema: z.ZodType<Prisma.Prompt_commentsDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_commentsSelectSchema).optional(),
  include: z.lazy(() => Prompt_commentsIncludeSchema).optional(),
}).strict();

export const Prompt_commentsCountOutputTypeArgsSchema: z.ZodType<Prisma.Prompt_commentsCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => Prompt_commentsCountOutputTypeSelectSchema).nullish(),
}).strict();

export const Prompt_commentsCountOutputTypeSelectSchema: z.ZodType<Prisma.Prompt_commentsCountOutputTypeSelect> = z.object({
  replies: z.boolean().optional(),
}).strict();

export const Prompt_commentsSelectSchema: z.ZodType<Prisma.Prompt_commentsSelect> = z.object({
  id: z.boolean().optional(),
  content: z.boolean().optional(),
  attachment_url: z.boolean().optional(),
  prompt_id: z.boolean().optional(),
  user_id: z.boolean().optional(),
  parent_id: z.boolean().optional(),
  created_at: z.boolean().optional(),
  updated_at: z.boolean().optional(),
  prompt: z.union([z.boolean(),z.lazy(() => PromptsArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UsersArgsSchema)]).optional(),
  parent: z.union([z.boolean(),z.lazy(() => Prompt_commentsArgsSchema)]).optional(),
  replies: z.union([z.boolean(),z.lazy(() => Prompt_commentsFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => Prompt_commentsCountOutputTypeArgsSchema)]).optional(),
}).strict()


/////////////////////////////////////////
// INPUT TYPES
/////////////////////////////////////////

export const UsersWhereInputSchema: z.ZodType<Prisma.UsersWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UsersWhereInputSchema), z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersWhereInputSchema), z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  prompts: z.lazy(() => PromptsListRelationFilterSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoritesListRelationFilterSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runListRelationFilterSchema).optional(),
  activityLogs: z.lazy(() => Activity_logListRelationFilterSchema).optional(),
  comments: z.lazy(() => Prompt_commentsListRelationFilterSchema).optional(),
});

export const UsersOrderByWithRelationInputSchema: z.ZodType<Prisma.UsersOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  prompts: z.lazy(() => PromptsOrderByRelationAggregateInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsOrderByRelationAggregateInputSchema).optional(),
  favorites: z.lazy(() => FavoritesOrderByRelationAggregateInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runOrderByRelationAggregateInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logOrderByRelationAggregateInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsOrderByRelationAggregateInputSchema).optional(),
});

export const UsersWhereUniqueInputSchema: z.ZodType<Prisma.UsersWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    email: z.string(),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    email: z.string(),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  email: z.string().optional(),
  AND: z.union([ z.lazy(() => UsersWhereInputSchema), z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersWhereInputSchema), z.lazy(() => UsersWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
  prompts: z.lazy(() => PromptsListRelationFilterSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoritesListRelationFilterSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runListRelationFilterSchema).optional(),
  activityLogs: z.lazy(() => Activity_logListRelationFilterSchema).optional(),
  comments: z.lazy(() => Prompt_commentsListRelationFilterSchema).optional(),
}));

export const UsersOrderByWithAggregationInputSchema: z.ZodType<Prisma.UsersOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => UsersCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => UsersAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => UsersMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => UsersMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => UsersSumOrderByAggregateInputSchema).optional(),
});

export const UsersScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.UsersScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => UsersScalarWhereWithAggregatesInputSchema), z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => UsersScalarWhereWithAggregatesInputSchema), z.lazy(() => UsersScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  email: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  password: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => EnumUserStatusWithAggregatesFilterSchema), z.lazy(() => UserStatusSchema) ]).optional(),
});

export const CategoriesWhereInputSchema: z.ZodType<Prisma.CategoriesWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoriesWhereInputSchema), z.lazy(() => CategoriesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoriesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoriesWhereInputSchema), z.lazy(() => CategoriesWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompts: z.lazy(() => PromptsListRelationFilterSchema).optional(),
});

export const CategoriesOrderByWithRelationInputSchema: z.ZodType<Prisma.CategoriesOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompts: z.lazy(() => PromptsOrderByRelationAggregateInputSchema).optional(),
});

export const CategoriesWhereUniqueInputSchema: z.ZodType<Prisma.CategoriesWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    name: z.string(),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    name: z.string(),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  name: z.string().optional(),
  AND: z.union([ z.lazy(() => CategoriesWhereInputSchema), z.lazy(() => CategoriesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoriesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoriesWhereInputSchema), z.lazy(() => CategoriesWhereInputSchema).array() ]).optional(),
  color: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompts: z.lazy(() => PromptsListRelationFilterSchema).optional(),
}));

export const CategoriesOrderByWithAggregationInputSchema: z.ZodType<Prisma.CategoriesOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CategoriesCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CategoriesAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CategoriesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CategoriesMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CategoriesSumOrderByAggregateInputSchema).optional(),
});

export const CategoriesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CategoriesScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CategoriesScalarWhereWithAggregatesInputSchema), z.lazy(() => CategoriesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CategoriesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CategoriesScalarWhereWithAggregatesInputSchema), z.lazy(() => CategoriesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  color: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const PromptsWhereInputSchema: z.ZodType<Prisma.PromptsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PromptsWhereInputSchema), z.lazy(() => PromptsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PromptsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PromptsWhereInputSchema), z.lazy(() => PromptsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  latest_version_no: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  recommended_model: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  is_template_active: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deleted_at: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category_id: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  owner_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  category: z.union([ z.lazy(() => CategoriesNullableScalarRelationFilterSchema), z.lazy(() => CategoriesWhereInputSchema) ]).optional().nullable(),
  owner: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsListRelationFilterSchema).optional(),
  variables: z.lazy(() => Prompt_variablesListRelationFilterSchema).optional(),
  tags: z.lazy(() => Prompt_tagsListRelationFilterSchema).optional(),
  collections: z.lazy(() => Collections_promptsListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoritesListRelationFilterSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runListRelationFilterSchema).optional(),
  comments: z.lazy(() => Prompt_commentsListRelationFilterSchema).optional(),
});

export const PromptsOrderByWithRelationInputSchema: z.ZodType<Prisma.PromptsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  recommended_model: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  is_template_active: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  deleted_at: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  category_id: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
  category: z.lazy(() => CategoriesOrderByWithRelationInputSchema).optional(),
  owner: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsOrderByRelationAggregateInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesOrderByRelationAggregateInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsOrderByRelationAggregateInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsOrderByRelationAggregateInputSchema).optional(),
  favorites: z.lazy(() => FavoritesOrderByRelationAggregateInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runOrderByRelationAggregateInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsOrderByRelationAggregateInputSchema).optional(),
});

export const PromptsWhereUniqueInputSchema: z.ZodType<Prisma.PromptsWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => PromptsWhereInputSchema), z.lazy(() => PromptsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PromptsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PromptsWhereInputSchema), z.lazy(() => PromptsWhereInputSchema).array() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  latest_version_no: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  recommended_model: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  is_template_active: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deleted_at: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category_id: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  owner_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  category: z.union([ z.lazy(() => CategoriesNullableScalarRelationFilterSchema), z.lazy(() => CategoriesWhereInputSchema) ]).optional().nullable(),
  owner: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsListRelationFilterSchema).optional(),
  variables: z.lazy(() => Prompt_variablesListRelationFilterSchema).optional(),
  tags: z.lazy(() => Prompt_tagsListRelationFilterSchema).optional(),
  collections: z.lazy(() => Collections_promptsListRelationFilterSchema).optional(),
  favorites: z.lazy(() => FavoritesListRelationFilterSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runListRelationFilterSchema).optional(),
  comments: z.lazy(() => Prompt_commentsListRelationFilterSchema).optional(),
}));

export const PromptsOrderByWithAggregationInputSchema: z.ZodType<Prisma.PromptsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  recommended_model: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  is_template_active: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  deleted_at: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  category_id: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PromptsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => PromptsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PromptsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PromptsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => PromptsSumOrderByAggregateInputSchema).optional(),
});

export const PromptsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.PromptsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PromptsScalarWhereWithAggregatesInputSchema), z.lazy(() => PromptsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => PromptsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PromptsScalarWhereWithAggregatesInputSchema), z.lazy(() => PromptsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  latest_version_no: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  recommended_model: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  is_template_active: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  deleted_at: z.union([ z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date() ]).optional().nullable(),
  category_id: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  owner_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export const TagsWhereInputSchema: z.ZodType<Prisma.TagsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => TagsWhereInputSchema), z.lazy(() => TagsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagsWhereInputSchema), z.lazy(() => TagsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompts: z.lazy(() => Prompt_tagsListRelationFilterSchema).optional(),
});

export const TagsOrderByWithRelationInputSchema: z.ZodType<Prisma.TagsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  prompts: z.lazy(() => Prompt_tagsOrderByRelationAggregateInputSchema).optional(),
});

export const TagsWhereUniqueInputSchema: z.ZodType<Prisma.TagsWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    name: z.string(),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    name: z.string(),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  name: z.string().optional(),
  AND: z.union([ z.lazy(() => TagsWhereInputSchema), z.lazy(() => TagsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagsWhereInputSchema), z.lazy(() => TagsWhereInputSchema).array() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompts: z.lazy(() => Prompt_tagsListRelationFilterSchema).optional(),
}));

export const TagsOrderByWithAggregationInputSchema: z.ZodType<Prisma.TagsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => TagsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => TagsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => TagsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => TagsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => TagsSumOrderByAggregateInputSchema).optional(),
});

export const TagsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.TagsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => TagsScalarWhereWithAggregatesInputSchema), z.lazy(() => TagsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => TagsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TagsScalarWhereWithAggregatesInputSchema), z.lazy(() => TagsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const Prompt_versionsWhereInputSchema: z.ZodType<Prisma.Prompt_versionsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_versionsWhereInputSchema), z.lazy(() => Prompt_versionsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_versionsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_versionsWhereInputSchema), z.lazy(() => Prompt_versionsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  version_no: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  template_content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  system_prompt: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  output_format: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  changelog: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  created_by: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  creator: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  promptVariables: z.lazy(() => Prompt_variablesListRelationFilterSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runListRelationFilterSchema).optional(),
});

export const Prompt_versionsOrderByWithRelationInputSchema: z.ZodType<Prisma.Prompt_versionsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  template_content: z.lazy(() => SortOrderSchema).optional(),
  system_prompt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  output_format: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  changelog: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
  creator: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
  promptVariables: z.lazy(() => Prompt_variablesOrderByRelationAggregateInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runOrderByRelationAggregateInputSchema).optional(),
});

export const Prompt_versionsWhereUniqueInputSchema: z.ZodType<Prisma.Prompt_versionsWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    uq_prompt_versions: z.lazy(() => Prompt_versionsUq_prompt_versionsCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    uq_prompt_versions: z.lazy(() => Prompt_versionsUq_prompt_versionsCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  uq_prompt_versions: z.lazy(() => Prompt_versionsUq_prompt_versionsCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => Prompt_versionsWhereInputSchema), z.lazy(() => Prompt_versionsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_versionsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_versionsWhereInputSchema), z.lazy(() => Prompt_versionsWhereInputSchema).array() ]).optional(),
  version_no: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  template_content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  system_prompt: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  output_format: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  changelog: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  created_by: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  creator: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  promptVariables: z.lazy(() => Prompt_variablesListRelationFilterSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runListRelationFilterSchema).optional(),
}));

export const Prompt_versionsOrderByWithAggregationInputSchema: z.ZodType<Prisma.Prompt_versionsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  template_content: z.lazy(() => SortOrderSchema).optional(),
  system_prompt: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  output_format: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  changelog: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Prompt_versionsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Prompt_versionsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Prompt_versionsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Prompt_versionsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Prompt_versionsSumOrderByAggregateInputSchema).optional(),
});

export const Prompt_versionsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Prompt_versionsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_versionsScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_versionsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_versionsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_versionsScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_versionsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  version_no: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  template_content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  system_prompt: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  output_format: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  changelog: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  created_by: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export const Prompt_variablesWhereInputSchema: z.ZodType<Prisma.Prompt_variablesWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_variablesWhereInputSchema), z.lazy(() => Prompt_variablesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_variablesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_variablesWhereInputSchema), z.lazy(() => Prompt_variablesWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  label: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  is_required: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  default_value: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  placeholder: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  options_json: z.lazy(() => JsonNullableFilterSchema).optional(),
  sort_order: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  prompt_version: z.union([ z.lazy(() => Prompt_versionsNullableScalarRelationFilterSchema), z.lazy(() => Prompt_versionsWhereInputSchema) ]).optional().nullable(),
});

export const Prompt_variablesOrderByWithRelationInputSchema: z.ZodType<Prisma.Prompt_variablesOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  is_required: z.lazy(() => SortOrderSchema).optional(),
  default_value: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  placeholder: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  options_json: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
  prompt_version: z.lazy(() => Prompt_versionsOrderByWithRelationInputSchema).optional(),
});

export const Prompt_variablesWhereUniqueInputSchema: z.ZodType<Prisma.Prompt_variablesWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    uq_prompt_variable_version_name: z.lazy(() => Prompt_variablesUq_prompt_variable_version_nameCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    uq_prompt_variable_version_name: z.lazy(() => Prompt_variablesUq_prompt_variable_version_nameCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  uq_prompt_variable_version_name: z.lazy(() => Prompt_variablesUq_prompt_variable_version_nameCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => Prompt_variablesWhereInputSchema), z.lazy(() => Prompt_variablesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_variablesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_variablesWhereInputSchema), z.lazy(() => Prompt_variablesWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  label: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  is_required: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  default_value: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  placeholder: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  options_json: z.lazy(() => JsonNullableFilterSchema).optional(),
  sort_order: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  prompt_version: z.union([ z.lazy(() => Prompt_versionsNullableScalarRelationFilterSchema), z.lazy(() => Prompt_versionsWhereInputSchema) ]).optional().nullable(),
}));

export const Prompt_variablesOrderByWithAggregationInputSchema: z.ZodType<Prisma.Prompt_variablesOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  is_required: z.lazy(() => SortOrderSchema).optional(),
  default_value: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  placeholder: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  options_json: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Prompt_variablesCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Prompt_variablesAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Prompt_variablesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Prompt_variablesMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Prompt_variablesSumOrderByAggregateInputSchema).optional(),
});

export const Prompt_variablesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Prompt_variablesScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_variablesScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_variablesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_variablesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_variablesScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_variablesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  label: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  is_required: z.union([ z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean() ]).optional(),
  default_value: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  placeholder: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  options_json: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  sort_order: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export const Prompt_tagsWhereInputSchema: z.ZodType<Prisma.Prompt_tagsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_tagsWhereInputSchema), z.lazy(() => Prompt_tagsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_tagsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_tagsWhereInputSchema), z.lazy(() => Prompt_tagsWhereInputSchema).array() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  tag_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  tag: z.union([ z.lazy(() => TagsScalarRelationFilterSchema), z.lazy(() => TagsWhereInputSchema) ]).optional(),
});

export const Prompt_tagsOrderByWithRelationInputSchema: z.ZodType<Prisma.Prompt_tagsOrderByWithRelationInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
  tag: z.lazy(() => TagsOrderByWithRelationInputSchema).optional(),
});

export const Prompt_tagsWhereUniqueInputSchema: z.ZodType<Prisma.Prompt_tagsWhereUniqueInput> = z.object({
  prompt_id_tag_id: z.lazy(() => Prompt_tagsPrompt_idTag_idCompoundUniqueInputSchema),
})
.and(z.strictObject({
  prompt_id_tag_id: z.lazy(() => Prompt_tagsPrompt_idTag_idCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => Prompt_tagsWhereInputSchema), z.lazy(() => Prompt_tagsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_tagsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_tagsWhereInputSchema), z.lazy(() => Prompt_tagsWhereInputSchema).array() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  tag_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  tag: z.union([ z.lazy(() => TagsScalarRelationFilterSchema), z.lazy(() => TagsWhereInputSchema) ]).optional(),
}));

export const Prompt_tagsOrderByWithAggregationInputSchema: z.ZodType<Prisma.Prompt_tagsOrderByWithAggregationInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Prompt_tagsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Prompt_tagsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Prompt_tagsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Prompt_tagsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Prompt_tagsSumOrderByAggregateInputSchema).optional(),
});

export const Prompt_tagsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Prompt_tagsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_tagsScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_tagsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_tagsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_tagsScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_tagsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  tag_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export const CollectionsWhereInputSchema: z.ZodType<Prisma.CollectionsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CollectionsWhereInputSchema), z.lazy(() => CollectionsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CollectionsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CollectionsWhereInputSchema), z.lazy(() => CollectionsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  visibility: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompts: z.lazy(() => Collections_promptsListRelationFilterSchema).optional(),
});

export const CollectionsOrderByWithRelationInputSchema: z.ZodType<Prisma.CollectionsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompts: z.lazy(() => Collections_promptsOrderByRelationAggregateInputSchema).optional(),
});

export const CollectionsWhereUniqueInputSchema: z.ZodType<Prisma.CollectionsWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => CollectionsWhereInputSchema), z.lazy(() => CollectionsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CollectionsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CollectionsWhereInputSchema), z.lazy(() => CollectionsWhereInputSchema).array() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  visibility: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompts: z.lazy(() => Collections_promptsListRelationFilterSchema).optional(),
}));

export const CollectionsOrderByWithAggregationInputSchema: z.ZodType<Prisma.CollectionsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => CollectionsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => CollectionsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => CollectionsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => CollectionsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => CollectionsSumOrderByAggregateInputSchema).optional(),
});

export const CollectionsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CollectionsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => CollectionsScalarWhereWithAggregatesInputSchema), z.lazy(() => CollectionsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => CollectionsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CollectionsScalarWhereWithAggregatesInputSchema), z.lazy(() => CollectionsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  visibility: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const Collections_promptsWhereInputSchema: z.ZodType<Prisma.Collections_promptsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Collections_promptsWhereInputSchema), z.lazy(() => Collections_promptsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Collections_promptsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Collections_promptsWhereInputSchema), z.lazy(() => Collections_promptsWhereInputSchema).array() ]).optional(),
  collection_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  sort_order: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  collection: z.union([ z.lazy(() => CollectionsScalarRelationFilterSchema), z.lazy(() => CollectionsWhereInputSchema) ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
});

export const Collections_promptsOrderByWithRelationInputSchema: z.ZodType<Prisma.Collections_promptsOrderByWithRelationInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  collection: z.lazy(() => CollectionsOrderByWithRelationInputSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
});

export const Collections_promptsWhereUniqueInputSchema: z.ZodType<Prisma.Collections_promptsWhereUniqueInput> = z.object({
  collection_id_prompt_id: z.lazy(() => Collections_promptsCollection_idPrompt_idCompoundUniqueInputSchema),
})
.and(z.strictObject({
  collection_id_prompt_id: z.lazy(() => Collections_promptsCollection_idPrompt_idCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => Collections_promptsWhereInputSchema), z.lazy(() => Collections_promptsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Collections_promptsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Collections_promptsWhereInputSchema), z.lazy(() => Collections_promptsWhereInputSchema).array() ]).optional(),
  collection_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  sort_order: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  collection: z.union([ z.lazy(() => CollectionsScalarRelationFilterSchema), z.lazy(() => CollectionsWhereInputSchema) ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
}));

export const Collections_promptsOrderByWithAggregationInputSchema: z.ZodType<Prisma.Collections_promptsOrderByWithAggregationInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Collections_promptsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Collections_promptsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Collections_promptsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Collections_promptsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Collections_promptsSumOrderByAggregateInputSchema).optional(),
});

export const Collections_promptsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Collections_promptsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Collections_promptsScalarWhereWithAggregatesInputSchema), z.lazy(() => Collections_promptsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Collections_promptsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Collections_promptsScalarWhereWithAggregatesInputSchema), z.lazy(() => Collections_promptsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  collection_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  sort_order: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
});

export const FavoritesWhereInputSchema: z.ZodType<Prisma.FavoritesWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => FavoritesWhereInputSchema), z.lazy(() => FavoritesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoritesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoritesWhereInputSchema), z.lazy(() => FavoritesWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
});

export const FavoritesOrderByWithRelationInputSchema: z.ZodType<Prisma.FavoritesOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
});

export const FavoritesWhereUniqueInputSchema: z.ZodType<Prisma.FavoritesWhereUniqueInput> = z.union([
  z.object({
    id: z.number().int(),
    uq_favorites: z.lazy(() => FavoritesUq_favoritesCompoundUniqueInputSchema),
  }),
  z.object({
    id: z.number().int(),
  }),
  z.object({
    uq_favorites: z.lazy(() => FavoritesUq_favoritesCompoundUniqueInputSchema),
  }),
])
.and(z.strictObject({
  id: z.number().int().optional(),
  uq_favorites: z.lazy(() => FavoritesUq_favoritesCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => FavoritesWhereInputSchema), z.lazy(() => FavoritesWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoritesWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoritesWhereInputSchema), z.lazy(() => FavoritesWhereInputSchema).array() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
}));

export const FavoritesOrderByWithAggregationInputSchema: z.ZodType<Prisma.FavoritesOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => FavoritesCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => FavoritesAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => FavoritesMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => FavoritesMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => FavoritesSumOrderByAggregateInputSchema).optional(),
});

export const FavoritesScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FavoritesScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => FavoritesScalarWhereWithAggregatesInputSchema), z.lazy(() => FavoritesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoritesScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoritesScalarWhereWithAggregatesInputSchema), z.lazy(() => FavoritesScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const Prompt_runWhereInputSchema: z.ZodType<Prisma.Prompt_runWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_runWhereInputSchema), z.lazy(() => Prompt_runWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_runWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_runWhereInputSchema), z.lazy(() => Prompt_runWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  rendered_prompt: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  variables_input: z.lazy(() => JsonNullableFilterSchema).optional(),
  output_response: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  execution_time_ms: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  token_used: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  model: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  error_message: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  prompt_version: z.union([ z.lazy(() => Prompt_versionsScalarRelationFilterSchema), z.lazy(() => Prompt_versionsWhereInputSchema) ]).optional(),
});

export const Prompt_runOrderByWithRelationInputSchema: z.ZodType<Prisma.Prompt_runOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  rendered_prompt: z.lazy(() => SortOrderSchema).optional(),
  variables_input: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  output_response: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  execution_time_ms: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
  model: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  error_message: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
  prompt_version: z.lazy(() => Prompt_versionsOrderByWithRelationInputSchema).optional(),
});

export const Prompt_runWhereUniqueInputSchema: z.ZodType<Prisma.Prompt_runWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => Prompt_runWhereInputSchema), z.lazy(() => Prompt_runWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_runWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_runWhereInputSchema), z.lazy(() => Prompt_runWhereInputSchema).array() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  rendered_prompt: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  variables_input: z.lazy(() => JsonNullableFilterSchema).optional(),
  output_response: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  execution_time_ms: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  token_used: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  model: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  error_message: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  prompt_version: z.union([ z.lazy(() => Prompt_versionsScalarRelationFilterSchema), z.lazy(() => Prompt_versionsWhereInputSchema) ]).optional(),
}));

export const Prompt_runOrderByWithAggregationInputSchema: z.ZodType<Prisma.Prompt_runOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  rendered_prompt: z.lazy(() => SortOrderSchema).optional(),
  variables_input: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  output_response: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  execution_time_ms: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
  model: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  error_message: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Prompt_runCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Prompt_runAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Prompt_runMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Prompt_runMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Prompt_runSumOrderByAggregateInputSchema).optional(),
});

export const Prompt_runScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Prompt_runScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_runScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_runScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_runScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_runScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_runScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  rendered_prompt: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  variables_input: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  output_response: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  execution_time_ms: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  token_used: z.union([ z.lazy(() => FloatWithAggregatesFilterSchema), z.number() ]).optional(),
  model: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  error_message: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const Activity_logWhereInputSchema: z.ZodType<Prisma.Activity_logWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Activity_logWhereInputSchema), z.lazy(() => Activity_logWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Activity_logWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Activity_logWhereInputSchema), z.lazy(() => Activity_logWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  action: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  details: z.lazy(() => JsonNullableFilterSchema).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
});

export const Activity_logOrderByWithRelationInputSchema: z.ZodType<Prisma.Activity_logOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  details: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  user: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
});

export const Activity_logWhereUniqueInputSchema: z.ZodType<Prisma.Activity_logWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => Activity_logWhereInputSchema), z.lazy(() => Activity_logWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Activity_logWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Activity_logWhereInputSchema), z.lazy(() => Activity_logWhereInputSchema).array() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  action: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  details: z.lazy(() => JsonNullableFilterSchema).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
}));

export const Activity_logOrderByWithAggregationInputSchema: z.ZodType<Prisma.Activity_logOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  details: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Activity_logCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Activity_logAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Activity_logMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Activity_logMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Activity_logSumOrderByAggregateInputSchema).optional(),
});

export const Activity_logScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Activity_logScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Activity_logScalarWhereWithAggregatesInputSchema), z.lazy(() => Activity_logScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Activity_logScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Activity_logScalarWhereWithAggregatesInputSchema), z.lazy(() => Activity_logScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  action: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  details: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const Prompt_commentsWhereInputSchema: z.ZodType<Prisma.Prompt_commentsWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_commentsWhereInputSchema), z.lazy(() => Prompt_commentsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_commentsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_commentsWhereInputSchema), z.lazy(() => Prompt_commentsWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  attachment_url: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  parent_id: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  parent: z.union([ z.lazy(() => Prompt_commentsNullableScalarRelationFilterSchema), z.lazy(() => Prompt_commentsWhereInputSchema) ]).optional().nullable(),
  replies: z.lazy(() => Prompt_commentsListRelationFilterSchema).optional(),
});

export const Prompt_commentsOrderByWithRelationInputSchema: z.ZodType<Prisma.Prompt_commentsOrderByWithRelationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  attachment_url: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompt: z.lazy(() => PromptsOrderByWithRelationInputSchema).optional(),
  user: z.lazy(() => UsersOrderByWithRelationInputSchema).optional(),
  parent: z.lazy(() => Prompt_commentsOrderByWithRelationInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsOrderByRelationAggregateInputSchema).optional(),
});

export const Prompt_commentsWhereUniqueInputSchema: z.ZodType<Prisma.Prompt_commentsWhereUniqueInput> = z.object({
  id: z.number().int(),
})
.and(z.strictObject({
  id: z.number().int().optional(),
  AND: z.union([ z.lazy(() => Prompt_commentsWhereInputSchema), z.lazy(() => Prompt_commentsWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_commentsWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_commentsWhereInputSchema), z.lazy(() => Prompt_commentsWhereInputSchema).array() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  attachment_url: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number().int() ]).optional(),
  parent_id: z.union([ z.lazy(() => IntNullableFilterSchema), z.number().int() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompt: z.union([ z.lazy(() => PromptsScalarRelationFilterSchema), z.lazy(() => PromptsWhereInputSchema) ]).optional(),
  user: z.union([ z.lazy(() => UsersScalarRelationFilterSchema), z.lazy(() => UsersWhereInputSchema) ]).optional(),
  parent: z.union([ z.lazy(() => Prompt_commentsNullableScalarRelationFilterSchema), z.lazy(() => Prompt_commentsWhereInputSchema) ]).optional().nullable(),
  replies: z.lazy(() => Prompt_commentsListRelationFilterSchema).optional(),
}));

export const Prompt_commentsOrderByWithAggregationInputSchema: z.ZodType<Prisma.Prompt_commentsOrderByWithAggregationInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  attachment_url: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.union([ z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema) ]).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => Prompt_commentsCountOrderByAggregateInputSchema).optional(),
  _avg: z.lazy(() => Prompt_commentsAvgOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => Prompt_commentsMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => Prompt_commentsMinOrderByAggregateInputSchema).optional(),
  _sum: z.lazy(() => Prompt_commentsSumOrderByAggregateInputSchema).optional(),
});

export const Prompt_commentsScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.Prompt_commentsScalarWhereWithAggregatesInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_commentsScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_commentsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_commentsScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_commentsScalarWhereWithAggregatesInputSchema), z.lazy(() => Prompt_commentsScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringWithAggregatesFilterSchema), z.string() ]).optional(),
  attachment_url: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string() ]).optional().nullable(),
  prompt_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntWithAggregatesFilterSchema), z.number() ]).optional(),
  parent_id: z.union([ z.lazy(() => IntNullableWithAggregatesFilterSchema), z.number() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date() ]).optional(),
});

export const UsersCreateInputSchema: z.ZodType<Prisma.UsersCreateInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateInputSchema: z.ZodType<Prisma.UsersUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUpdateInputSchema: z.ZodType<Prisma.UsersUpdateInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersCreateManyInputSchema: z.ZodType<Prisma.UsersCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
});

export const UsersUpdateManyMutationInputSchema: z.ZodType<Prisma.UsersUpdateManyMutationInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UsersUncheckedUpdateManyInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CategoriesCreateInputSchema: z.ZodType<Prisma.CategoriesCreateInput> = z.strictObject({
  name: z.string(),
  color: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export const CategoriesUncheckedCreateInputSchema: z.ZodType<Prisma.CategoriesUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  color: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutCategoryInputSchema).optional(),
});

export const CategoriesUpdateInputSchema: z.ZodType<Prisma.CategoriesUpdateInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export const CategoriesUncheckedUpdateInputSchema: z.ZodType<Prisma.CategoriesUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutCategoryNestedInputSchema).optional(),
});

export const CategoriesCreateManyInputSchema: z.ZodType<Prisma.CategoriesCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  color: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CategoriesUpdateManyMutationInputSchema: z.ZodType<Prisma.CategoriesUpdateManyMutationInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CategoriesUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CategoriesUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PromptsCreateInputSchema: z.ZodType<Prisma.PromptsCreateInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUpdateInputSchema: z.ZodType<Prisma.PromptsUpdateInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsCreateManyInputSchema: z.ZodType<Prisma.PromptsCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
});

export const PromptsUpdateManyMutationInputSchema: z.ZodType<Prisma.PromptsUpdateManyMutationInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const PromptsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TagsCreateInputSchema: z.ZodType<Prisma.TagsCreateInput> = z.strictObject({
  name: z.string(),
  created_at: z.coerce.date().optional(),
  prompts: z.lazy(() => Prompt_tagsCreateNestedManyWithoutTagInputSchema).optional(),
});

export const TagsUncheckedCreateInputSchema: z.ZodType<Prisma.TagsUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  created_at: z.coerce.date().optional(),
  prompts: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutTagInputSchema).optional(),
});

export const TagsUpdateInputSchema: z.ZodType<Prisma.TagsUpdateInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => Prompt_tagsUpdateManyWithoutTagNestedInputSchema).optional(),
});

export const TagsUncheckedUpdateInputSchema: z.ZodType<Prisma.TagsUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutTagNestedInputSchema).optional(),
});

export const TagsCreateManyInputSchema: z.ZodType<Prisma.TagsCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  created_at: z.coerce.date().optional(),
});

export const TagsUpdateManyMutationInputSchema: z.ZodType<Prisma.TagsUpdateManyMutationInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TagsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.TagsUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_versionsCreateInputSchema: z.ZodType<Prisma.Prompt_versionsCreateInput> = z.strictObject({
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutVersionsInputSchema),
  creator: z.lazy(() => UsersCreateNestedOneWithoutCreated_versionsInputSchema),
  promptVariables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsUncheckedCreateInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt_id: z.number().int(),
  created_by: z.number().int(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsUpdateInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateInput> = z.strictObject({
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutVersionsNestedInputSchema).optional(),
  creator: z.lazy(() => UsersUpdateOneRequiredWithoutCreated_versionsNestedInputSchema).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_by: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsCreateManyInputSchema: z.ZodType<Prisma.Prompt_versionsCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt_id: z.number().int(),
  created_by: z.number().int(),
});

export const Prompt_versionsUpdateManyMutationInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyMutationInput> = z.strictObject({
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_versionsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_by: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesCreateInputSchema: z.ZodType<Prisma.Prompt_variablesCreateInput> = z.strictObject({
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutVariablesInputSchema),
  prompt_version: z.lazy(() => Prompt_versionsCreateNestedOneWithoutPromptVariablesInputSchema).optional(),
});

export const Prompt_variablesUncheckedCreateInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
});

export const Prompt_variablesUpdateInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutVariablesNestedInputSchema).optional(),
  prompt_version: z.lazy(() => Prompt_versionsUpdateOneWithoutPromptVariablesNestedInputSchema).optional(),
});

export const Prompt_variablesUncheckedUpdateInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesCreateManyInputSchema: z.ZodType<Prisma.Prompt_variablesCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
});

export const Prompt_variablesUpdateManyMutationInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyMutationInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_tagsCreateInputSchema: z.ZodType<Prisma.Prompt_tagsCreateInput> = z.strictObject({
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutTagsInputSchema),
  tag: z.lazy(() => TagsCreateNestedOneWithoutPromptsInputSchema),
});

export const Prompt_tagsUncheckedCreateInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedCreateInput> = z.strictObject({
  prompt_id: z.number().int(),
  tag_id: z.number().int(),
});

export const Prompt_tagsUpdateInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateInput> = z.strictObject({
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutTagsNestedInputSchema).optional(),
  tag: z.lazy(() => TagsUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
});

export const Prompt_tagsUncheckedUpdateInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateInput> = z.strictObject({
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  tag_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_tagsCreateManyInputSchema: z.ZodType<Prisma.Prompt_tagsCreateManyInput> = z.strictObject({
  prompt_id: z.number().int(),
  tag_id: z.number().int(),
});

export const Prompt_tagsUpdateManyMutationInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyMutationInput> = z.strictObject({
});

export const Prompt_tagsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateManyInput> = z.strictObject({
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  tag_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CollectionsCreateInputSchema: z.ZodType<Prisma.CollectionsCreateInput> = z.strictObject({
  name: z.string(),
  description: z.string().optional().nullable(),
  visibility: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompts: z.lazy(() => Collections_promptsCreateNestedManyWithoutCollectionInputSchema).optional(),
});

export const CollectionsUncheckedCreateInputSchema: z.ZodType<Prisma.CollectionsUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  visibility: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompts: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutCollectionInputSchema).optional(),
});

export const CollectionsUpdateInputSchema: z.ZodType<Prisma.CollectionsUpdateInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => Collections_promptsUpdateManyWithoutCollectionNestedInputSchema).optional(),
});

export const CollectionsUncheckedUpdateInputSchema: z.ZodType<Prisma.CollectionsUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutCollectionNestedInputSchema).optional(),
});

export const CollectionsCreateManyInputSchema: z.ZodType<Prisma.CollectionsCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  visibility: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CollectionsUpdateManyMutationInputSchema: z.ZodType<Prisma.CollectionsUpdateManyMutationInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CollectionsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.CollectionsUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsCreateInputSchema: z.ZodType<Prisma.Collections_promptsCreateInput> = z.strictObject({
  sort_order: z.number().int().optional(),
  collection: z.lazy(() => CollectionsCreateNestedOneWithoutPromptsInputSchema),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutCollectionsInputSchema),
});

export const Collections_promptsUncheckedCreateInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedCreateInput> = z.strictObject({
  collection_id: z.number().int(),
  prompt_id: z.number().int(),
  sort_order: z.number().int().optional(),
});

export const Collections_promptsUpdateInputSchema: z.ZodType<Prisma.Collections_promptsUpdateInput> = z.strictObject({
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  collection: z.lazy(() => CollectionsUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutCollectionsNestedInputSchema).optional(),
});

export const Collections_promptsUncheckedUpdateInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateInput> = z.strictObject({
  collection_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsCreateManyInputSchema: z.ZodType<Prisma.Collections_promptsCreateManyInput> = z.strictObject({
  collection_id: z.number().int(),
  prompt_id: z.number().int(),
  sort_order: z.number().int().optional(),
});

export const Collections_promptsUpdateManyMutationInputSchema: z.ZodType<Prisma.Collections_promptsUpdateManyMutationInput> = z.strictObject({
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateManyInput> = z.strictObject({
  collection_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesCreateInputSchema: z.ZodType<Prisma.FavoritesCreateInput> = z.strictObject({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutFavoritesInputSchema),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutFavoritesInputSchema),
});

export const FavoritesUncheckedCreateInputSchema: z.ZodType<Prisma.FavoritesUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  prompt_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const FavoritesUpdateInputSchema: z.ZodType<Prisma.FavoritesUpdateInput> = z.strictObject({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
});

export const FavoritesUncheckedUpdateInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesCreateManyInputSchema: z.ZodType<Prisma.FavoritesCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  prompt_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const FavoritesUpdateManyMutationInputSchema: z.ZodType<Prisma.FavoritesUpdateManyMutationInput> = z.strictObject({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesUncheckedUpdateManyInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runCreateInputSchema: z.ZodType<Prisma.Prompt_runCreateInput> = z.strictObject({
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutPromptRunsInputSchema),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutPromptRunsInputSchema),
  prompt_version: z.lazy(() => Prompt_versionsCreateNestedOneWithoutPromptRunsInputSchema),
});

export const Prompt_runUncheckedCreateInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runUpdateInputSchema: z.ZodType<Prisma.Prompt_runUpdateInput> = z.strictObject({
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
  prompt_version: z.lazy(() => Prompt_versionsUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
});

export const Prompt_runUncheckedUpdateInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runCreateManyInputSchema: z.ZodType<Prisma.Prompt_runCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runUpdateManyMutationInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyMutationInput> = z.strictObject({
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Activity_logCreateInputSchema: z.ZodType<Prisma.Activity_logCreateInput> = z.strictObject({
  action: z.string(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutActivityLogsInputSchema),
});

export const Activity_logUncheckedCreateInputSchema: z.ZodType<Prisma.Activity_logUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  action: z.string(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.coerce.date().optional(),
});

export const Activity_logUpdateInputSchema: z.ZodType<Prisma.Activity_logUpdateInput> = z.strictObject({
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutActivityLogsNestedInputSchema).optional(),
});

export const Activity_logUncheckedUpdateInputSchema: z.ZodType<Prisma.Activity_logUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Activity_logCreateManyInputSchema: z.ZodType<Prisma.Activity_logCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  action: z.string(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.coerce.date().optional(),
});

export const Activity_logUpdateManyMutationInputSchema: z.ZodType<Prisma.Activity_logUpdateManyMutationInput> = z.strictObject({
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Activity_logUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Activity_logUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_commentsCreateInputSchema: z.ZodType<Prisma.Prompt_commentsCreateInput> = z.strictObject({
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UsersCreateNestedOneWithoutCommentsInputSchema),
  parent: z.lazy(() => Prompt_commentsCreateNestedOneWithoutRepliesInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsUncheckedCreateInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsUpdateInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateInput> = z.strictObject({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  parent: z.lazy(() => Prompt_commentsUpdateOneWithoutRepliesNestedInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsCreateManyInputSchema: z.ZodType<Prisma.Prompt_commentsCreateManyInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_commentsUpdateManyMutationInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyMutationInput> = z.strictObject({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_commentsUncheckedUpdateManyInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const IntFilterSchema: z.ZodType<Prisma.IntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const StringFilterSchema: z.ZodType<Prisma.StringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const DateTimeFilterSchema: z.ZodType<Prisma.DateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const EnumUserStatusFilterSchema: z.ZodType<Prisma.EnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
});

export const PromptsListRelationFilterSchema: z.ZodType<Prisma.PromptsListRelationFilter> = z.strictObject({
  every: z.lazy(() => PromptsWhereInputSchema).optional(),
  some: z.lazy(() => PromptsWhereInputSchema).optional(),
  none: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const Prompt_versionsListRelationFilterSchema: z.ZodType<Prisma.Prompt_versionsListRelationFilter> = z.strictObject({
  every: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
  some: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
  none: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
});

export const FavoritesListRelationFilterSchema: z.ZodType<Prisma.FavoritesListRelationFilter> = z.strictObject({
  every: z.lazy(() => FavoritesWhereInputSchema).optional(),
  some: z.lazy(() => FavoritesWhereInputSchema).optional(),
  none: z.lazy(() => FavoritesWhereInputSchema).optional(),
});

export const Prompt_runListRelationFilterSchema: z.ZodType<Prisma.Prompt_runListRelationFilter> = z.strictObject({
  every: z.lazy(() => Prompt_runWhereInputSchema).optional(),
  some: z.lazy(() => Prompt_runWhereInputSchema).optional(),
  none: z.lazy(() => Prompt_runWhereInputSchema).optional(),
});

export const Activity_logListRelationFilterSchema: z.ZodType<Prisma.Activity_logListRelationFilter> = z.strictObject({
  every: z.lazy(() => Activity_logWhereInputSchema).optional(),
  some: z.lazy(() => Activity_logWhereInputSchema).optional(),
  none: z.lazy(() => Activity_logWhereInputSchema).optional(),
});

export const Prompt_commentsListRelationFilterSchema: z.ZodType<Prisma.Prompt_commentsListRelationFilter> = z.strictObject({
  every: z.lazy(() => Prompt_commentsWhereInputSchema).optional(),
  some: z.lazy(() => Prompt_commentsWhereInputSchema).optional(),
  none: z.lazy(() => Prompt_commentsWhereInputSchema).optional(),
});

export const PromptsOrderByRelationAggregateInputSchema: z.ZodType<Prisma.PromptsOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_versionsOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Prompt_versionsOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const FavoritesOrderByRelationAggregateInputSchema: z.ZodType<Prisma.FavoritesOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_runOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Prompt_runOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const Activity_logOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Activity_logOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_commentsOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Prompt_commentsOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const UsersCountOrderByAggregateInputSchema: z.ZodType<Prisma.UsersCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
});

export const UsersAvgOrderByAggregateInputSchema: z.ZodType<Prisma.UsersAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const UsersMaxOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
});

export const UsersMinOrderByAggregateInputSchema: z.ZodType<Prisma.UsersMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  email: z.lazy(() => SortOrderSchema).optional(),
  password: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
});

export const UsersSumOrderByAggregateInputSchema: z.ZodType<Prisma.UsersSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const IntWithAggregatesFilterSchema: z.ZodType<Prisma.IntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const StringWithAggregatesFilterSchema: z.ZodType<Prisma.StringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const DateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const EnumUserStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumUserStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
});

export const StringNullableFilterSchema: z.ZodType<Prisma.StringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const SortOrderInputSchema: z.ZodType<Prisma.SortOrderInput> = z.strictObject({
  sort: z.lazy(() => SortOrderSchema),
  nulls: z.lazy(() => NullsOrderSchema).optional(),
});

export const CategoriesCountOrderByAggregateInputSchema: z.ZodType<Prisma.CategoriesCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoriesAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CategoriesAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoriesMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CategoriesMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoriesMinOrderByAggregateInputSchema: z.ZodType<Prisma.CategoriesMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  color: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const CategoriesSumOrderByAggregateInputSchema: z.ZodType<Prisma.CategoriesSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const StringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.StringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const BoolFilterSchema: z.ZodType<Prisma.BoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
});

export const DateTimeNullableFilterSchema: z.ZodType<Prisma.DateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const IntNullableFilterSchema: z.ZodType<Prisma.IntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const CategoriesNullableScalarRelationFilterSchema: z.ZodType<Prisma.CategoriesNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CategoriesWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => CategoriesWhereInputSchema).optional().nullable(),
});

export const UsersScalarRelationFilterSchema: z.ZodType<Prisma.UsersScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => UsersWhereInputSchema).optional(),
  isNot: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const Prompt_variablesListRelationFilterSchema: z.ZodType<Prisma.Prompt_variablesListRelationFilter> = z.strictObject({
  every: z.lazy(() => Prompt_variablesWhereInputSchema).optional(),
  some: z.lazy(() => Prompt_variablesWhereInputSchema).optional(),
  none: z.lazy(() => Prompt_variablesWhereInputSchema).optional(),
});

export const Prompt_tagsListRelationFilterSchema: z.ZodType<Prisma.Prompt_tagsListRelationFilter> = z.strictObject({
  every: z.lazy(() => Prompt_tagsWhereInputSchema).optional(),
  some: z.lazy(() => Prompt_tagsWhereInputSchema).optional(),
  none: z.lazy(() => Prompt_tagsWhereInputSchema).optional(),
});

export const Collections_promptsListRelationFilterSchema: z.ZodType<Prisma.Collections_promptsListRelationFilter> = z.strictObject({
  every: z.lazy(() => Collections_promptsWhereInputSchema).optional(),
  some: z.lazy(() => Collections_promptsWhereInputSchema).optional(),
  none: z.lazy(() => Collections_promptsWhereInputSchema).optional(),
});

export const Prompt_variablesOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Prompt_variablesOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_tagsOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Prompt_tagsOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const Collections_promptsOrderByRelationAggregateInputSchema: z.ZodType<Prisma.Collections_promptsOrderByRelationAggregateInput> = z.strictObject({
  _count: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsCountOrderByAggregateInputSchema: z.ZodType<Prisma.PromptsCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  recommended_model: z.lazy(() => SortOrderSchema).optional(),
  is_template_active: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  deleted_at: z.lazy(() => SortOrderSchema).optional(),
  category_id: z.lazy(() => SortOrderSchema).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PromptsAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  category_id: z.lazy(() => SortOrderSchema).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PromptsMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  recommended_model: z.lazy(() => SortOrderSchema).optional(),
  is_template_active: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  deleted_at: z.lazy(() => SortOrderSchema).optional(),
  category_id: z.lazy(() => SortOrderSchema).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsMinOrderByAggregateInputSchema: z.ZodType<Prisma.PromptsMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  recommended_model: z.lazy(() => SortOrderSchema).optional(),
  is_template_active: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  deleted_at: z.lazy(() => SortOrderSchema).optional(),
  category_id: z.lazy(() => SortOrderSchema).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsSumOrderByAggregateInputSchema: z.ZodType<Prisma.PromptsSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  latest_version_no: z.lazy(() => SortOrderSchema).optional(),
  category_id: z.lazy(() => SortOrderSchema).optional(),
  owner_id: z.lazy(() => SortOrderSchema).optional(),
});

export const BoolWithAggregatesFilterSchema: z.ZodType<Prisma.BoolWithAggregatesFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
});

export const DateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.DateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const IntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.IntNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
});

export const TagsCountOrderByAggregateInputSchema: z.ZodType<Prisma.TagsCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
});

export const TagsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.TagsAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const TagsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.TagsMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
});

export const TagsMinOrderByAggregateInputSchema: z.ZodType<Prisma.TagsMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
});

export const TagsSumOrderByAggregateInputSchema: z.ZodType<Prisma.TagsSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsScalarRelationFilterSchema: z.ZodType<Prisma.PromptsScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => PromptsWhereInputSchema).optional(),
  isNot: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const Prompt_versionsUq_prompt_versionsCompoundUniqueInputSchema: z.ZodType<Prisma.Prompt_versionsUq_prompt_versionsCompoundUniqueInput> = z.strictObject({
  prompt_id: z.number(),
  version_no: z.number(),
});

export const Prompt_versionsCountOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_versionsCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  template_content: z.lazy(() => SortOrderSchema).optional(),
  system_prompt: z.lazy(() => SortOrderSchema).optional(),
  output_format: z.lazy(() => SortOrderSchema).optional(),
  changelog: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_versionsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_versionsAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_versionsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_versionsMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  template_content: z.lazy(() => SortOrderSchema).optional(),
  system_prompt: z.lazy(() => SortOrderSchema).optional(),
  output_format: z.lazy(() => SortOrderSchema).optional(),
  changelog: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_versionsMinOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_versionsMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  template_content: z.lazy(() => SortOrderSchema).optional(),
  system_prompt: z.lazy(() => SortOrderSchema).optional(),
  output_format: z.lazy(() => SortOrderSchema).optional(),
  changelog: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_versionsSumOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_versionsSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  version_no: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_by: z.lazy(() => SortOrderSchema).optional(),
});

export const JsonNullableFilterSchema: z.ZodType<Prisma.JsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const Prompt_versionsNullableScalarRelationFilterSchema: z.ZodType<Prisma.Prompt_versionsNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => Prompt_versionsWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => Prompt_versionsWhereInputSchema).optional().nullable(),
});

export const Prompt_variablesUq_prompt_variable_version_nameCompoundUniqueInputSchema: z.ZodType<Prisma.Prompt_variablesUq_prompt_variable_version_nameCompoundUniqueInput> = z.strictObject({
  prompt_version_id: z.number(),
  name: z.string(),
});

export const Prompt_variablesCountOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_variablesCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  is_required: z.lazy(() => SortOrderSchema).optional(),
  default_value: z.lazy(() => SortOrderSchema).optional(),
  placeholder: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  options_json: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_variablesAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_variablesAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_variablesMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_variablesMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  is_required: z.lazy(() => SortOrderSchema).optional(),
  default_value: z.lazy(() => SortOrderSchema).optional(),
  placeholder: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_variablesMinOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_variablesMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  label: z.lazy(() => SortOrderSchema).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  is_required: z.lazy(() => SortOrderSchema).optional(),
  default_value: z.lazy(() => SortOrderSchema).optional(),
  placeholder: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_variablesSumOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_variablesSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
});

export const JsonNullableWithAggregatesFilterSchema: z.ZodType<Prisma.JsonNullableWithAggregatesFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedJsonNullableFilterSchema).optional(),
});

export const TagsScalarRelationFilterSchema: z.ZodType<Prisma.TagsScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => TagsWhereInputSchema).optional(),
  isNot: z.lazy(() => TagsWhereInputSchema).optional(),
});

export const Prompt_tagsPrompt_idTag_idCompoundUniqueInputSchema: z.ZodType<Prisma.Prompt_tagsPrompt_idTag_idCompoundUniqueInput> = z.strictObject({
  prompt_id: z.number(),
  tag_id: z.number(),
});

export const Prompt_tagsCountOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_tagsCountOrderByAggregateInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_tagsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_tagsAvgOrderByAggregateInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_tagsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_tagsMaxOrderByAggregateInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_tagsMinOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_tagsMinOrderByAggregateInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_tagsSumOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_tagsSumOrderByAggregateInput> = z.strictObject({
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  tag_id: z.lazy(() => SortOrderSchema).optional(),
});

export const CollectionsCountOrderByAggregateInputSchema: z.ZodType<Prisma.CollectionsCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const CollectionsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.CollectionsAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const CollectionsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.CollectionsMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const CollectionsMinOrderByAggregateInputSchema: z.ZodType<Prisma.CollectionsMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  description: z.lazy(() => SortOrderSchema).optional(),
  visibility: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const CollectionsSumOrderByAggregateInputSchema: z.ZodType<Prisma.CollectionsSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
});

export const CollectionsScalarRelationFilterSchema: z.ZodType<Prisma.CollectionsScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => CollectionsWhereInputSchema).optional(),
  isNot: z.lazy(() => CollectionsWhereInputSchema).optional(),
});

export const Collections_promptsCollection_idPrompt_idCompoundUniqueInputSchema: z.ZodType<Prisma.Collections_promptsCollection_idPrompt_idCompoundUniqueInput> = z.strictObject({
  collection_id: z.number(),
  prompt_id: z.number(),
});

export const Collections_promptsCountOrderByAggregateInputSchema: z.ZodType<Prisma.Collections_promptsCountOrderByAggregateInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
});

export const Collections_promptsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Collections_promptsAvgOrderByAggregateInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
});

export const Collections_promptsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Collections_promptsMaxOrderByAggregateInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
});

export const Collections_promptsMinOrderByAggregateInputSchema: z.ZodType<Prisma.Collections_promptsMinOrderByAggregateInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
});

export const Collections_promptsSumOrderByAggregateInputSchema: z.ZodType<Prisma.Collections_promptsSumOrderByAggregateInput> = z.strictObject({
  collection_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  sort_order: z.lazy(() => SortOrderSchema).optional(),
});

export const FavoritesUq_favoritesCompoundUniqueInputSchema: z.ZodType<Prisma.FavoritesUq_favoritesCompoundUniqueInput> = z.strictObject({
  user_id: z.number(),
  prompt_id: z.number(),
});

export const FavoritesCountOrderByAggregateInputSchema: z.ZodType<Prisma.FavoritesCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const FavoritesAvgOrderByAggregateInputSchema: z.ZodType<Prisma.FavoritesAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
});

export const FavoritesMaxOrderByAggregateInputSchema: z.ZodType<Prisma.FavoritesMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const FavoritesMinOrderByAggregateInputSchema: z.ZodType<Prisma.FavoritesMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const FavoritesSumOrderByAggregateInputSchema: z.ZodType<Prisma.FavoritesSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
});

export const FloatFilterSchema: z.ZodType<Prisma.FloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const Prompt_versionsScalarRelationFilterSchema: z.ZodType<Prisma.Prompt_versionsScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
  isNot: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
});

export const Prompt_runCountOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_runCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  rendered_prompt: z.lazy(() => SortOrderSchema).optional(),
  variables_input: z.lazy(() => SortOrderSchema).optional(),
  output_response: z.lazy(() => SortOrderSchema).optional(),
  execution_time_ms: z.lazy(() => SortOrderSchema).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  error_message: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_runAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_runAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  execution_time_ms: z.lazy(() => SortOrderSchema).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_runMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_runMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  rendered_prompt: z.lazy(() => SortOrderSchema).optional(),
  output_response: z.lazy(() => SortOrderSchema).optional(),
  execution_time_ms: z.lazy(() => SortOrderSchema).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  error_message: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_runMinOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_runMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  rendered_prompt: z.lazy(() => SortOrderSchema).optional(),
  output_response: z.lazy(() => SortOrderSchema).optional(),
  execution_time_ms: z.lazy(() => SortOrderSchema).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
  model: z.lazy(() => SortOrderSchema).optional(),
  status: z.lazy(() => SortOrderSchema).optional(),
  error_message: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_runSumOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_runSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  prompt_version_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  execution_time_ms: z.lazy(() => SortOrderSchema).optional(),
  token_used: z.lazy(() => SortOrderSchema).optional(),
});

export const FloatWithAggregatesFilterSchema: z.ZodType<Prisma.FloatWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional(),
});

export const Activity_logCountOrderByAggregateInputSchema: z.ZodType<Prisma.Activity_logCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  details: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Activity_logAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Activity_logAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Activity_logMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Activity_logMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Activity_logMinOrderByAggregateInputSchema: z.ZodType<Prisma.Activity_logMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  action: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Activity_logSumOrderByAggregateInputSchema: z.ZodType<Prisma.Activity_logSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_commentsNullableScalarRelationFilterSchema: z.ZodType<Prisma.Prompt_commentsNullableScalarRelationFilter> = z.strictObject({
  is: z.lazy(() => Prompt_commentsWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => Prompt_commentsWhereInputSchema).optional().nullable(),
});

export const Prompt_commentsCountOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_commentsCountOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  attachment_url: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_commentsAvgOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_commentsAvgOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_commentsMaxOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_commentsMaxOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  attachment_url: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_commentsMinOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_commentsMinOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  content: z.lazy(() => SortOrderSchema).optional(),
  attachment_url: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.lazy(() => SortOrderSchema).optional(),
  created_at: z.lazy(() => SortOrderSchema).optional(),
  updated_at: z.lazy(() => SortOrderSchema).optional(),
});

export const Prompt_commentsSumOrderByAggregateInputSchema: z.ZodType<Prisma.Prompt_commentsSumOrderByAggregateInput> = z.strictObject({
  id: z.lazy(() => SortOrderSchema).optional(),
  prompt_id: z.lazy(() => SortOrderSchema).optional(),
  user_id: z.lazy(() => SortOrderSchema).optional(),
  parent_id: z.lazy(() => SortOrderSchema).optional(),
});

export const PromptsCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsCreateNestedManyWithoutOwnerInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutOwnerInputSchema), z.lazy(() => PromptsCreateWithoutOwnerInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_versionsCreateNestedManyWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsCreateNestedManyWithoutCreatorInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyCreatorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
});

export const FavoritesCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.FavoritesCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutUserInputSchema), z.lazy(() => FavoritesCreateWithoutUserInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_runCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutUserInputSchema), z.lazy(() => Prompt_runCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
});

export const Activity_logCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.Activity_logCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => Activity_logCreateWithoutUserInputSchema), z.lazy(() => Activity_logCreateWithoutUserInputSchema).array(), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema), z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Activity_logCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_commentsCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
});

export const PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateNestedManyWithoutOwnerInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutOwnerInputSchema), z.lazy(() => PromptsCreateWithoutOwnerInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyOwnerInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyCreatorInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
});

export const FavoritesUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutUserInputSchema), z.lazy(() => FavoritesCreateWithoutUserInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutUserInputSchema), z.lazy(() => Prompt_runCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
});

export const Activity_logUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => Activity_logCreateWithoutUserInputSchema), z.lazy(() => Activity_logCreateWithoutUserInputSchema).array(), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema), z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Activity_logCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateNestedManyWithoutUserInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
});

export const StringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.StringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional(),
});

export const DateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.DateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional(),
});

export const EnumUserStatusFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumUserStatusFieldUpdateOperationsInput> = z.strictObject({
  set: z.lazy(() => UserStatusSchema).optional(),
});

export const PromptsUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.PromptsUpdateManyWithoutOwnerNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutOwnerInputSchema), z.lazy(() => PromptsCreateWithoutOwnerInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PromptsUpsertWithWhereUniqueWithoutOwnerInputSchema), z.lazy(() => PromptsUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateWithWhereUniqueWithoutOwnerInputSchema), z.lazy(() => PromptsUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PromptsUpdateManyWithWhereWithoutOwnerInputSchema), z.lazy(() => PromptsUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PromptsScalarWhereInputSchema), z.lazy(() => PromptsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyWithoutCreatorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutCreatorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyCreatorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutCreatorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutCreatorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_versionsScalarWhereInputSchema), z.lazy(() => Prompt_versionsScalarWhereInputSchema).array() ]).optional(),
});

export const FavoritesUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.FavoritesUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutUserInputSchema), z.lazy(() => FavoritesCreateWithoutUserInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoritesUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => FavoritesUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoritesScalarWhereInputSchema), z.lazy(() => FavoritesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_runUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutUserInputSchema), z.lazy(() => Prompt_runCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_runUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => Prompt_runUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
});

export const Activity_logUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.Activity_logUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Activity_logCreateWithoutUserInputSchema), z.lazy(() => Activity_logCreateWithoutUserInputSchema).array(), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema), z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Activity_logUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Activity_logUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Activity_logCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Activity_logUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Activity_logUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Activity_logUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => Activity_logUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Activity_logScalarWhereInputSchema), z.lazy(() => Activity_logScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_commentsUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
});

export const IntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.IntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateManyWithoutOwnerNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutOwnerInputSchema), z.lazy(() => PromptsCreateWithoutOwnerInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutOwnerInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PromptsUpsertWithWhereUniqueWithoutOwnerInputSchema), z.lazy(() => PromptsUpsertWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyOwnerInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateWithWhereUniqueWithoutOwnerInputSchema), z.lazy(() => PromptsUpdateWithWhereUniqueWithoutOwnerInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PromptsUpdateManyWithWhereWithoutOwnerInputSchema), z.lazy(() => PromptsUpdateManyWithWhereWithoutOwnerInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PromptsScalarWhereInputSchema), z.lazy(() => PromptsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutCreatorInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutCreatorInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyCreatorInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutCreatorInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutCreatorInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_versionsScalarWhereInputSchema), z.lazy(() => Prompt_versionsScalarWhereInputSchema).array() ]).optional(),
});

export const FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutUserInputSchema), z.lazy(() => FavoritesCreateWithoutUserInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoritesUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => FavoritesUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoritesScalarWhereInputSchema), z.lazy(() => FavoritesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutUserInputSchema), z.lazy(() => Prompt_runCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_runUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => Prompt_runUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
});

export const Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.Activity_logUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Activity_logCreateWithoutUserInputSchema), z.lazy(() => Activity_logCreateWithoutUserInputSchema).array(), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema), z.lazy(() => Activity_logCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Activity_logUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Activity_logUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Activity_logCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Activity_logWhereUniqueInputSchema), z.lazy(() => Activity_logWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Activity_logUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Activity_logUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Activity_logUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => Activity_logUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Activity_logScalarWhereInputSchema), z.lazy(() => Activity_logScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyWithoutUserNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutUserInputSchema), z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutUserInputSchema), z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
});

export const PromptsCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsCreateNestedManyWithoutCategoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCategoryInputSchema), z.lazy(() => PromptsCreateWithoutCategoryInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
});

export const PromptsUncheckedCreateNestedManyWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateNestedManyWithoutCategoryInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCategoryInputSchema), z.lazy(() => PromptsCreateWithoutCategoryInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyCategoryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
});

export const NullableStringFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableStringFieldUpdateOperationsInput> = z.strictObject({
  set: z.string().optional().nullable(),
});

export const PromptsUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.PromptsUpdateManyWithoutCategoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCategoryInputSchema), z.lazy(() => PromptsCreateWithoutCategoryInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PromptsUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => PromptsUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => PromptsUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PromptsUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => PromptsUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PromptsScalarWhereInputSchema), z.lazy(() => PromptsScalarWhereInputSchema).array() ]).optional(),
});

export const PromptsUncheckedUpdateManyWithoutCategoryNestedInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateManyWithoutCategoryNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCategoryInputSchema), z.lazy(() => PromptsCreateWithoutCategoryInputSchema).array(), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema), z.lazy(() => PromptsCreateOrConnectWithoutCategoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => PromptsUpsertWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => PromptsUpsertWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => PromptsCreateManyCategoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => PromptsWhereUniqueInputSchema), z.lazy(() => PromptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateWithWhereUniqueWithoutCategoryInputSchema), z.lazy(() => PromptsUpdateWithWhereUniqueWithoutCategoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => PromptsUpdateManyWithWhereWithoutCategoryInputSchema), z.lazy(() => PromptsUpdateManyWithWhereWithoutCategoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => PromptsScalarWhereInputSchema), z.lazy(() => PromptsScalarWhereInputSchema).array() ]).optional(),
});

export const CategoriesCreateNestedOneWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesCreateNestedOneWithoutPromptsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoriesCreateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoriesCreateOrConnectWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => CategoriesWhereUniqueInputSchema).optional(),
});

export const UsersCreateNestedOneWithoutPromptsInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutPromptsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
});

export const Prompt_versionsCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_variablesCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_tagsCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
});

export const Collections_promptsCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
});

export const FavoritesCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutPromptInputSchema), z.lazy(() => FavoritesCreateWithoutPromptInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_runCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_commentsCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
});

export const Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
});

export const FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutPromptInputSchema), z.lazy(() => FavoritesCreateWithoutPromptInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateNestedManyWithoutPromptInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyPromptInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
});

export const BoolFieldUpdateOperationsInputSchema: z.ZodType<Prisma.BoolFieldUpdateOperationsInput> = z.strictObject({
  set: z.boolean().optional(),
});

export const NullableDateTimeFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableDateTimeFieldUpdateOperationsInput> = z.strictObject({
  set: z.coerce.date().optional().nullable(),
});

export const CategoriesUpdateOneWithoutPromptsNestedInputSchema: z.ZodType<Prisma.CategoriesUpdateOneWithoutPromptsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CategoriesCreateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CategoriesCreateOrConnectWithoutPromptsInputSchema).optional(),
  upsert: z.lazy(() => CategoriesUpsertWithoutPromptsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CategoriesWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CategoriesWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CategoriesWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CategoriesUpdateToOneWithWhereWithoutPromptsInputSchema), z.lazy(() => CategoriesUpdateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedUpdateWithoutPromptsInputSchema) ]).optional(),
});

export const UsersUpdateOneRequiredWithoutPromptsNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutPromptsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutPromptsInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateToOneWithWhereWithoutPromptsInputSchema), z.lazy(() => UsersUpdateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutPromptsInputSchema) ]).optional(),
});

export const Prompt_versionsUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_versionsScalarWhereInputSchema), z.lazy(() => Prompt_versionsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_variablesUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_variablesScalarWhereInputSchema), z.lazy(() => Prompt_variablesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_tagsUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_tagsScalarWhereInputSchema), z.lazy(() => Prompt_tagsScalarWhereInputSchema).array() ]).optional(),
});

export const Collections_promptsUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Collections_promptsUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Collections_promptsScalarWhereInputSchema), z.lazy(() => Collections_promptsScalarWhereInputSchema).array() ]).optional(),
});

export const FavoritesUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.FavoritesUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutPromptInputSchema), z.lazy(() => FavoritesCreateWithoutPromptInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoritesUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => FavoritesUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoritesScalarWhereInputSchema), z.lazy(() => FavoritesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_runUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_commentsUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
});

export const NullableIntFieldUpdateOperationsInputSchema: z.ZodType<Prisma.NullableIntFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional().nullable(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_versionsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_versionsWhereUniqueInputSchema), z.lazy(() => Prompt_versionsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_versionsScalarWhereInputSchema), z.lazy(() => Prompt_versionsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_variablesScalarWhereInputSchema), z.lazy(() => Prompt_variablesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_tagsScalarWhereInputSchema), z.lazy(() => Prompt_tagsScalarWhereInputSchema).array() ]).optional(),
});

export const Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Collections_promptsScalarWhereInputSchema), z.lazy(() => Collections_promptsScalarWhereInputSchema).array() ]).optional(),
});

export const FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => FavoritesCreateWithoutPromptInputSchema), z.lazy(() => FavoritesCreateWithoutPromptInputSchema).array(), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema), z.lazy(() => FavoritesCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => FavoritesUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => FavoritesCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FavoritesWhereUniqueInputSchema), z.lazy(() => FavoritesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => FavoritesUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FavoritesUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => FavoritesUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FavoritesScalarWhereInputSchema), z.lazy(() => FavoritesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutPromptInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyPromptInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutPromptInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutPromptInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_tagsCreateNestedManyWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsCreateNestedManyWithoutTagInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyTagInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_tagsUncheckedCreateNestedManyWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedCreateNestedManyWithoutTagInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyTagInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_tagsUpdateManyWithoutTagNestedInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyWithoutTagNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutTagInputSchema), z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutTagInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyTagInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutTagInputSchema), z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutTagInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutTagInputSchema), z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutTagInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_tagsScalarWhereInputSchema), z.lazy(() => Prompt_tagsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_tagsUncheckedUpdateManyWithoutTagNestedInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateManyWithoutTagNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema).array(), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema), z.lazy(() => Prompt_tagsCreateOrConnectWithoutTagInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutTagInputSchema), z.lazy(() => Prompt_tagsUpsertWithWhereUniqueWithoutTagInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_tagsCreateManyTagInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_tagsWhereUniqueInputSchema), z.lazy(() => Prompt_tagsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutTagInputSchema), z.lazy(() => Prompt_tagsUpdateWithWhereUniqueWithoutTagInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutTagInputSchema), z.lazy(() => Prompt_tagsUpdateManyWithWhereWithoutTagInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_tagsScalarWhereInputSchema), z.lazy(() => Prompt_tagsScalarWhereInputSchema).array() ]).optional(),
});

export const PromptsCreateNestedOneWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutVersionsInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVersionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutVersionsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const UsersCreateNestedOneWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutCreated_versionsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCreated_versionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutCreated_versionsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
});

export const Prompt_variablesCreateNestedManyWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesCreateNestedManyWithoutPrompt_versionInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_runCreateNestedManyWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runCreateNestedManyWithoutPrompt_versionInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_variablesUncheckedCreateNestedManyWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedCreateNestedManyWithoutPrompt_versionInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_runUncheckedCreateNestedManyWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateNestedManyWithoutPrompt_versionInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
});

export const PromptsUpdateOneRequiredWithoutVersionsNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutVersionsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVersionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutVersionsInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutVersionsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutVersionsInputSchema), z.lazy(() => PromptsUpdateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutVersionsInputSchema) ]).optional(),
});

export const UsersUpdateOneRequiredWithoutCreated_versionsNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutCreated_versionsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCreated_versionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutCreated_versionsInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutCreated_versionsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateToOneWithWhereWithoutCreated_versionsInputSchema), z.lazy(() => UsersUpdateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutCreated_versionsInputSchema) ]).optional(),
});

export const Prompt_variablesUpdateManyWithoutPrompt_versionNestedInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyWithoutPrompt_versionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPrompt_versionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_variablesScalarWhereInputSchema), z.lazy(() => Prompt_variablesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_runUpdateManyWithoutPrompt_versionNestedInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyWithoutPrompt_versionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPrompt_versionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUpsertWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_variablesCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_variablesWhereUniqueInputSchema), z.lazy(() => Prompt_variablesWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUpdateWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUpdateManyWithWhereWithoutPrompt_versionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_variablesScalarWhereInputSchema), z.lazy(() => Prompt_variablesScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_runUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyWithoutPrompt_versionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema).array(), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUpsertWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_runCreateManyPrompt_versionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_runWhereUniqueInputSchema), z.lazy(() => Prompt_runWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUpdateWithWhereUniqueWithoutPrompt_versionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUpdateManyWithWhereWithoutPrompt_versionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
});

export const PromptsCreateNestedOneWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutVariablesInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVariablesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutVariablesInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const Prompt_versionsCreateNestedOneWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsCreateNestedOneWithoutPromptVariablesInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptVariablesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptVariablesInputSchema).optional(),
  connect: z.lazy(() => Prompt_versionsWhereUniqueInputSchema).optional(),
});

export const PromptsUpdateOneRequiredWithoutVariablesNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutVariablesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVariablesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutVariablesInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutVariablesInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutVariablesInputSchema), z.lazy(() => PromptsUpdateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutVariablesInputSchema) ]).optional(),
});

export const Prompt_versionsUpdateOneWithoutPromptVariablesNestedInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateOneWithoutPromptVariablesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptVariablesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptVariablesInputSchema).optional(),
  upsert: z.lazy(() => Prompt_versionsUpsertWithoutPromptVariablesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => Prompt_versionsWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => Prompt_versionsWhereInputSchema) ]).optional(),
  connect: z.lazy(() => Prompt_versionsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateToOneWithWhereWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUpdateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptVariablesInputSchema) ]).optional(),
});

export const PromptsCreateNestedOneWithoutTagsInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutTagsInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutTagsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const TagsCreateNestedOneWithoutPromptsInputSchema: z.ZodType<Prisma.TagsCreateNestedOneWithoutPromptsInput> = z.strictObject({
  create: z.union([ z.lazy(() => TagsCreateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TagsCreateOrConnectWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => TagsWhereUniqueInputSchema).optional(),
});

export const PromptsUpdateOneRequiredWithoutTagsNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutTagsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutTagsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutTagsInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutTagsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutTagsInputSchema), z.lazy(() => PromptsUpdateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutTagsInputSchema) ]).optional(),
});

export const TagsUpdateOneRequiredWithoutPromptsNestedInputSchema: z.ZodType<Prisma.TagsUpdateOneRequiredWithoutPromptsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => TagsCreateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TagsCreateOrConnectWithoutPromptsInputSchema).optional(),
  upsert: z.lazy(() => TagsUpsertWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => TagsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => TagsUpdateToOneWithWhereWithoutPromptsInputSchema), z.lazy(() => TagsUpdateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedUpdateWithoutPromptsInputSchema) ]).optional(),
});

export const Collections_promptsCreateNestedManyWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsCreateNestedManyWithoutCollectionInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyCollectionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
});

export const Collections_promptsUncheckedCreateNestedManyWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedCreateNestedManyWithoutCollectionInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyCollectionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
});

export const Collections_promptsUpdateManyWithoutCollectionNestedInputSchema: z.ZodType<Prisma.Collections_promptsUpdateManyWithoutCollectionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyCollectionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutCollectionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutCollectionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Collections_promptsScalarWhereInputSchema), z.lazy(() => Collections_promptsScalarWhereInputSchema).array() ]).optional(),
});

export const Collections_promptsUncheckedUpdateManyWithoutCollectionNestedInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateManyWithoutCollectionNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema).array(), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema), z.lazy(() => Collections_promptsCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUpsertWithWhereUniqueWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Collections_promptsCreateManyCollectionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Collections_promptsWhereUniqueInputSchema), z.lazy(() => Collections_promptsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUpdateWithWhereUniqueWithoutCollectionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUpdateManyWithWhereWithoutCollectionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Collections_promptsScalarWhereInputSchema), z.lazy(() => Collections_promptsScalarWhereInputSchema).array() ]).optional(),
});

export const CollectionsCreateNestedOneWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsCreateNestedOneWithoutPromptsInput> = z.strictObject({
  create: z.union([ z.lazy(() => CollectionsCreateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionsCreateOrConnectWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => CollectionsWhereUniqueInputSchema).optional(),
});

export const PromptsCreateNestedOneWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutCollectionsInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCollectionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutCollectionsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const CollectionsUpdateOneRequiredWithoutPromptsNestedInputSchema: z.ZodType<Prisma.CollectionsUpdateOneRequiredWithoutPromptsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => CollectionsCreateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedCreateWithoutPromptsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionsCreateOrConnectWithoutPromptsInputSchema).optional(),
  upsert: z.lazy(() => CollectionsUpsertWithoutPromptsInputSchema).optional(),
  connect: z.lazy(() => CollectionsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CollectionsUpdateToOneWithWhereWithoutPromptsInputSchema), z.lazy(() => CollectionsUpdateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedUpdateWithoutPromptsInputSchema) ]).optional(),
});

export const PromptsUpdateOneRequiredWithoutCollectionsNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutCollectionsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCollectionsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutCollectionsInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutCollectionsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutCollectionsInputSchema), z.lazy(() => PromptsUpdateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCollectionsInputSchema) ]).optional(),
});

export const UsersCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutFavoritesInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
});

export const PromptsCreateNestedOneWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutFavoritesInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const UsersUpdateOneRequiredWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutFavoritesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateToOneWithWhereWithoutFavoritesInputSchema), z.lazy(() => UsersUpdateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
});

export const PromptsUpdateOneRequiredWithoutFavoritesNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutFavoritesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutFavoritesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutFavoritesInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutFavoritesInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutFavoritesInputSchema), z.lazy(() => PromptsUpdateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutFavoritesInputSchema) ]).optional(),
});

export const UsersCreateNestedOneWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutPromptRunsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutPromptRunsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
});

export const PromptsCreateNestedOneWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutPromptRunsInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutPromptRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutPromptRunsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const Prompt_versionsCreateNestedOneWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsCreateNestedOneWithoutPromptRunsInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptRunsInputSchema).optional(),
  connect: z.lazy(() => Prompt_versionsWhereUniqueInputSchema).optional(),
});

export const FloatFieldUpdateOperationsInputSchema: z.ZodType<Prisma.FloatFieldUpdateOperationsInput> = z.strictObject({
  set: z.number().optional(),
  increment: z.number().optional(),
  decrement: z.number().optional(),
  multiply: z.number().optional(),
  divide: z.number().optional(),
});

export const UsersUpdateOneRequiredWithoutPromptRunsNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutPromptRunsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutPromptRunsInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutPromptRunsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateToOneWithWhereWithoutPromptRunsInputSchema), z.lazy(() => UsersUpdateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutPromptRunsInputSchema) ]).optional(),
});

export const PromptsUpdateOneRequiredWithoutPromptRunsNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutPromptRunsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutPromptRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutPromptRunsInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutPromptRunsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutPromptRunsInputSchema), z.lazy(() => PromptsUpdateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutPromptRunsInputSchema) ]).optional(),
});

export const Prompt_versionsUpdateOneRequiredWithoutPromptRunsNestedInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateOneRequiredWithoutPromptRunsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptRunsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => Prompt_versionsCreateOrConnectWithoutPromptRunsInputSchema).optional(),
  upsert: z.lazy(() => Prompt_versionsUpsertWithoutPromptRunsInputSchema).optional(),
  connect: z.lazy(() => Prompt_versionsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateToOneWithWhereWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUpdateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptRunsInputSchema) ]).optional(),
});

export const UsersCreateNestedOneWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutActivityLogsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutActivityLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutActivityLogsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
});

export const UsersUpdateOneRequiredWithoutActivityLogsNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutActivityLogsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutActivityLogsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutActivityLogsInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutActivityLogsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateToOneWithWhereWithoutActivityLogsInputSchema), z.lazy(() => UsersUpdateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutActivityLogsInputSchema) ]).optional(),
});

export const PromptsCreateNestedOneWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsCreateNestedOneWithoutCommentsInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
});

export const UsersCreateNestedOneWithoutCommentsInputSchema: z.ZodType<Prisma.UsersCreateNestedOneWithoutCommentsInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
});

export const Prompt_commentsCreateNestedOneWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsCreateNestedOneWithoutRepliesInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => Prompt_commentsCreateOrConnectWithoutRepliesInputSchema).optional(),
  connect: z.lazy(() => Prompt_commentsWhereUniqueInputSchema).optional(),
});

export const Prompt_commentsCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsCreateNestedManyWithoutParentInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
});

export const Prompt_commentsUncheckedCreateNestedManyWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateNestedManyWithoutParentInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyParentInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
});

export const PromptsUpdateOneRequiredWithoutCommentsNestedInputSchema: z.ZodType<Prisma.PromptsUpdateOneRequiredWithoutCommentsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => PromptsCreateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => PromptsCreateOrConnectWithoutCommentsInputSchema).optional(),
  upsert: z.lazy(() => PromptsUpsertWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => PromptsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => PromptsUpdateToOneWithWhereWithoutCommentsInputSchema), z.lazy(() => PromptsUpdateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCommentsInputSchema) ]).optional(),
});

export const UsersUpdateOneRequiredWithoutCommentsNestedInputSchema: z.ZodType<Prisma.UsersUpdateOneRequiredWithoutCommentsNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => UsersCreateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCommentsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => UsersCreateOrConnectWithoutCommentsInputSchema).optional(),
  upsert: z.lazy(() => UsersUpsertWithoutCommentsInputSchema).optional(),
  connect: z.lazy(() => UsersWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => UsersUpdateToOneWithWhereWithoutCommentsInputSchema), z.lazy(() => UsersUpdateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutCommentsInputSchema) ]).optional(),
});

export const Prompt_commentsUpdateOneWithoutRepliesNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateOneWithoutRepliesNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutRepliesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => Prompt_commentsCreateOrConnectWithoutRepliesInputSchema).optional(),
  upsert: z.lazy(() => Prompt_commentsUpsertWithoutRepliesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => Prompt_commentsWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => Prompt_commentsWhereInputSchema) ]).optional(),
  connect: z.lazy(() => Prompt_commentsWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateToOneWithWhereWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUpdateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutRepliesInputSchema) ]).optional(),
});

export const Prompt_commentsUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyWithoutParentNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutParentInputSchema), z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutParentInputSchema), z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutParentInputSchema), z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
});

export const Prompt_commentsUncheckedUpdateManyWithoutParentNestedInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyWithoutParentNestedInput> = z.strictObject({
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema).array(), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema), z.lazy(() => Prompt_commentsCreateOrConnectWithoutParentInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutParentInputSchema), z.lazy(() => Prompt_commentsUpsertWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  createMany: z.lazy(() => Prompt_commentsCreateManyParentInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => Prompt_commentsWhereUniqueInputSchema), z.lazy(() => Prompt_commentsWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutParentInputSchema), z.lazy(() => Prompt_commentsUpdateWithWhereUniqueWithoutParentInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutParentInputSchema), z.lazy(() => Prompt_commentsUpdateManyWithWhereWithoutParentInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
});

export const NestedIntFilterSchema: z.ZodType<Prisma.NestedIntFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntFilterSchema) ]).optional(),
});

export const NestedStringFilterSchema: z.ZodType<Prisma.NestedStringFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringFilterSchema) ]).optional(),
});

export const NestedDateTimeFilterSchema: z.ZodType<Prisma.NestedDateTimeFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeFilterSchema) ]).optional(),
});

export const NestedEnumUserStatusFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusFilterSchema) ]).optional(),
});

export const NestedIntWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedIntFilterSchema).optional(),
  _max: z.lazy(() => NestedIntFilterSchema).optional(),
});

export const NestedFloatFilterSchema: z.ZodType<Prisma.NestedFloatFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatFilterSchema) ]).optional(),
});

export const NestedStringWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional(),
  in: z.string().array().optional(),
  notIn: z.string().array().optional(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedStringFilterSchema).optional(),
  _max: z.lazy(() => NestedStringFilterSchema).optional(),
});

export const NestedDateTimeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional(),
  in: z.coerce.date().array().optional(),
  notIn: z.coerce.date().array().optional(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeFilterSchema).optional(),
});

export const NestedEnumUserStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumUserStatusWithAggregatesFilter> = z.strictObject({
  equals: z.lazy(() => UserStatusSchema).optional(),
  in: z.lazy(() => UserStatusSchema).array().optional(),
  notIn: z.lazy(() => UserStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => NestedEnumUserStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumUserStatusFilterSchema).optional(),
});

export const NestedStringNullableFilterSchema: z.ZodType<Prisma.NestedStringNullableFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableFilterSchema) ]).optional().nullable(),
});

export const NestedStringNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedStringNullableWithAggregatesFilter> = z.strictObject({
  equals: z.string().optional().nullable(),
  in: z.string().array().optional().nullable(),
  notIn: z.string().array().optional().nullable(),
  lt: z.string().optional(),
  lte: z.string().optional(),
  gt: z.string().optional(),
  gte: z.string().optional(),
  contains: z.string().optional(),
  startsWith: z.string().optional(),
  endsWith: z.string().optional(),
  not: z.union([ z.string(),z.lazy(() => NestedStringNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedStringNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedStringNullableFilterSchema).optional(),
});

export const NestedIntNullableFilterSchema: z.ZodType<Prisma.NestedIntNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableFilterSchema) ]).optional().nullable(),
});

export const NestedBoolFilterSchema: z.ZodType<Prisma.NestedBoolFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolFilterSchema) ]).optional(),
});

export const NestedDateTimeNullableFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableFilterSchema) ]).optional().nullable(),
});

export const NestedBoolWithAggregatesFilterSchema: z.ZodType<Prisma.NestedBoolWithAggregatesFilter> = z.strictObject({
  equals: z.boolean().optional(),
  not: z.union([ z.boolean(),z.lazy(() => NestedBoolWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedBoolFilterSchema).optional(),
  _max: z.lazy(() => NestedBoolFilterSchema).optional(),
});

export const NestedDateTimeNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedDateTimeNullableWithAggregatesFilter> = z.strictObject({
  equals: z.coerce.date().optional().nullable(),
  in: z.coerce.date().array().optional().nullable(),
  notIn: z.coerce.date().array().optional().nullable(),
  lt: z.coerce.date().optional(),
  lte: z.coerce.date().optional(),
  gt: z.coerce.date().optional(),
  gte: z.coerce.date().optional(),
  not: z.union([ z.coerce.date(),z.lazy(() => NestedDateTimeNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedDateTimeNullableFilterSchema).optional(),
});

export const NestedIntNullableWithAggregatesFilterSchema: z.ZodType<Prisma.NestedIntNullableWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedIntNullableWithAggregatesFilterSchema) ]).optional().nullable(),
  _count: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatNullableFilterSchema).optional(),
  _sum: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _min: z.lazy(() => NestedIntNullableFilterSchema).optional(),
  _max: z.lazy(() => NestedIntNullableFilterSchema).optional(),
});

export const NestedFloatNullableFilterSchema: z.ZodType<Prisma.NestedFloatNullableFilter> = z.strictObject({
  equals: z.number().optional().nullable(),
  in: z.number().array().optional().nullable(),
  notIn: z.number().array().optional().nullable(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatNullableFilterSchema) ]).optional().nullable(),
});

export const NestedJsonNullableFilterSchema: z.ZodType<Prisma.NestedJsonNullableFilter> = z.strictObject({
  equals: InputJsonValueSchema.optional(),
  path: z.string().array().optional(),
  mode: z.lazy(() => QueryModeSchema).optional(),
  string_contains: z.string().optional(),
  string_starts_with: z.string().optional(),
  string_ends_with: z.string().optional(),
  array_starts_with: InputJsonValueSchema.optional().nullable(),
  array_ends_with: InputJsonValueSchema.optional().nullable(),
  array_contains: InputJsonValueSchema.optional().nullable(),
  lt: InputJsonValueSchema.optional(),
  lte: InputJsonValueSchema.optional(),
  gt: InputJsonValueSchema.optional(),
  gte: InputJsonValueSchema.optional(),
  not: InputJsonValueSchema.optional(),
});

export const NestedFloatWithAggregatesFilterSchema: z.ZodType<Prisma.NestedFloatWithAggregatesFilter> = z.strictObject({
  equals: z.number().optional(),
  in: z.number().array().optional(),
  notIn: z.number().array().optional(),
  lt: z.number().optional(),
  lte: z.number().optional(),
  gt: z.number().optional(),
  gte: z.number().optional(),
  not: z.union([ z.number(),z.lazy(() => NestedFloatWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _avg: z.lazy(() => NestedFloatFilterSchema).optional(),
  _sum: z.lazy(() => NestedFloatFilterSchema).optional(),
  _min: z.lazy(() => NestedFloatFilterSchema).optional(),
  _max: z.lazy(() => NestedFloatFilterSchema).optional(),
});

export const PromptsCreateWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsCreateWithoutOwnerInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutOwnerInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutOwnerInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema) ]),
});

export const PromptsCreateManyOwnerInputEnvelopeSchema: z.ZodType<Prisma.PromptsCreateManyOwnerInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => PromptsCreateManyOwnerInputSchema), z.lazy(() => PromptsCreateManyOwnerInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_versionsCreateWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsCreateWithoutCreatorInput> = z.strictObject({
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutVersionsInputSchema),
  promptVariables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsUncheckedCreateWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateWithoutCreatorInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt_id: z.number().int(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsCreateOrConnectWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsCreateOrConnectWithoutCreatorInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema) ]),
});

export const Prompt_versionsCreateManyCreatorInputEnvelopeSchema: z.ZodType<Prisma.Prompt_versionsCreateManyCreatorInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_versionsCreateManyCreatorInputSchema), z.lazy(() => Prompt_versionsCreateManyCreatorInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const FavoritesCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoritesCreateWithoutUserInput> = z.strictObject({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutFavoritesInputSchema),
});

export const FavoritesUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const FavoritesCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.FavoritesCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoritesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoritesCreateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema) ]),
});

export const FavoritesCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.FavoritesCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => FavoritesCreateManyUserInputSchema), z.lazy(() => FavoritesCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_runCreateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runCreateWithoutUserInput> = z.strictObject({
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutPromptRunsInputSchema),
  prompt_version: z.lazy(() => Prompt_versionsCreateNestedOneWithoutPromptRunsInputSchema),
});

export const Prompt_runUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema) ]),
});

export const Prompt_runCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.Prompt_runCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_runCreateManyUserInputSchema), z.lazy(() => Prompt_runCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Activity_logCreateWithoutUserInputSchema: z.ZodType<Prisma.Activity_logCreateWithoutUserInput> = z.strictObject({
  action: z.string(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.coerce.date().optional(),
});

export const Activity_logUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.number().int().optional(),
  action: z.string(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.coerce.date().optional(),
});

export const Activity_logCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.Activity_logCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Activity_logWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Activity_logCreateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema) ]),
});

export const Activity_logCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.Activity_logCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Activity_logCreateManyUserInputSchema), z.lazy(() => Activity_logCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_commentsCreateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsCreateWithoutUserInput> = z.strictObject({
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutCommentsInputSchema),
  parent: z.lazy(() => Prompt_commentsCreateNestedOneWithoutRepliesInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateWithoutUserInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsCreateOrConnectWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema) ]),
});

export const Prompt_commentsCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.Prompt_commentsCreateManyUserInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_commentsCreateManyUserInputSchema), z.lazy(() => Prompt_commentsCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PromptsUpsertWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUpsertWithWhereUniqueWithoutOwnerInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PromptsUpdateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutOwnerInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutOwnerInputSchema) ]),
});

export const PromptsUpdateWithWhereUniqueWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUpdateWithWhereUniqueWithoutOwnerInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutOwnerInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutOwnerInputSchema) ]),
});

export const PromptsUpdateManyWithWhereWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUpdateManyWithWhereWithoutOwnerInput> = z.strictObject({
  where: z.lazy(() => PromptsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PromptsUpdateManyMutationInputSchema), z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerInputSchema) ]),
});

export const PromptsScalarWhereInputSchema: z.ZodType<Prisma.PromptsScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => PromptsScalarWhereInputSchema), z.lazy(() => PromptsScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => PromptsScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => PromptsScalarWhereInputSchema), z.lazy(() => PromptsScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  title: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  visibility: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  latest_version_no: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  recommended_model: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  is_template_active: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  deleted_at: z.union([ z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date() ]).optional().nullable(),
  category_id: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  owner_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export const Prompt_versionsUpsertWithWhereUniqueWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUpsertWithWhereUniqueWithoutCreatorInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutCreatorInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutCreatorInputSchema) ]),
});

export const Prompt_versionsUpdateWithWhereUniqueWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateWithWhereUniqueWithoutCreatorInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutCreatorInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutCreatorInputSchema) ]),
});

export const Prompt_versionsUpdateManyWithWhereWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyWithWhereWithoutCreatorInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_versionsUpdateManyMutationInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorInputSchema) ]),
});

export const Prompt_versionsScalarWhereInputSchema: z.ZodType<Prisma.Prompt_versionsScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_versionsScalarWhereInputSchema), z.lazy(() => Prompt_versionsScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_versionsScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_versionsScalarWhereInputSchema), z.lazy(() => Prompt_versionsScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  version_no: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  template_content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  system_prompt: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  output_format: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  changelog: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  created_by: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export const FavoritesUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoritesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoritesUpdateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => FavoritesCreateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutUserInputSchema) ]),
});

export const FavoritesUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoritesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoritesUpdateWithoutUserInputSchema), z.lazy(() => FavoritesUncheckedUpdateWithoutUserInputSchema) ]),
});

export const FavoritesUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => FavoritesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoritesUpdateManyMutationInputSchema), z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const FavoritesScalarWhereInputSchema: z.ZodType<Prisma.FavoritesScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => FavoritesScalarWhereInputSchema), z.lazy(() => FavoritesScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoritesScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoritesScalarWhereInputSchema), z.lazy(() => FavoritesScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const Prompt_runUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutUserInputSchema) ]),
});

export const Prompt_runUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_runUpdateWithoutUserInputSchema), z.lazy(() => Prompt_runUncheckedUpdateWithoutUserInputSchema) ]),
});

export const Prompt_runUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_runScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_runUpdateManyMutationInputSchema), z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const Prompt_runScalarWhereInputSchema: z.ZodType<Prisma.Prompt_runScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_runScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_runScalarWhereInputSchema), z.lazy(() => Prompt_runScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  rendered_prompt: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  variables_input: z.lazy(() => JsonNullableFilterSchema).optional(),
  output_response: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  execution_time_ms: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  token_used: z.union([ z.lazy(() => FloatFilterSchema), z.number() ]).optional(),
  model: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  error_message: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const Activity_logUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Activity_logWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Activity_logUpdateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => Activity_logCreateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedCreateWithoutUserInputSchema) ]),
});

export const Activity_logUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Activity_logWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Activity_logUpdateWithoutUserInputSchema), z.lazy(() => Activity_logUncheckedUpdateWithoutUserInputSchema) ]),
});

export const Activity_logUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Activity_logScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Activity_logUpdateManyMutationInputSchema), z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const Activity_logScalarWhereInputSchema: z.ZodType<Prisma.Activity_logScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Activity_logScalarWhereInputSchema), z.lazy(() => Activity_logScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Activity_logScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Activity_logScalarWhereInputSchema), z.lazy(() => Activity_logScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  action: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  details: z.lazy(() => JsonNullableFilterSchema).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const Prompt_commentsUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUpsertWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutUserInputSchema) ]),
});

export const Prompt_commentsUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithWhereUniqueWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutUserInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutUserInputSchema) ]),
});

export const Prompt_commentsUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyWithWhereWithoutUserInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateManyMutationInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserInputSchema) ]),
});

export const Prompt_commentsScalarWhereInputSchema: z.ZodType<Prisma.Prompt_commentsScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_commentsScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_commentsScalarWhereInputSchema), z.lazy(() => Prompt_commentsScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  content: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  attachment_url: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  user_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  parent_id: z.union([ z.lazy(() => IntNullableFilterSchema), z.number() ]).optional().nullable(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
});

export const PromptsCreateWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsCreateWithoutCategoryInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutCategoryInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema) ]),
});

export const PromptsCreateManyCategoryInputEnvelopeSchema: z.ZodType<Prisma.PromptsCreateManyCategoryInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => PromptsCreateManyCategoryInputSchema), z.lazy(() => PromptsCreateManyCategoryInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PromptsUpsertWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUpsertWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => PromptsUpdateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCategoryInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCategoryInputSchema) ]),
});

export const PromptsUpdateWithWhereUniqueWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUpdateWithWhereUniqueWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutCategoryInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCategoryInputSchema) ]),
});

export const PromptsUpdateManyWithWhereWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUpdateManyWithWhereWithoutCategoryInput> = z.strictObject({
  where: z.lazy(() => PromptsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PromptsUpdateManyMutationInputSchema), z.lazy(() => PromptsUncheckedUpdateManyWithoutCategoryInputSchema) ]),
});

export const CategoriesCreateWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesCreateWithoutPromptsInput> = z.strictObject({
  name: z.string(),
  color: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CategoriesUncheckedCreateWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesUncheckedCreateWithoutPromptsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  color: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CategoriesCreateOrConnectWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesCreateOrConnectWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => CategoriesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CategoriesCreateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedCreateWithoutPromptsInputSchema) ]),
});

export const UsersCreateWithoutPromptsInputSchema: z.ZodType<Prisma.UsersCreateWithoutPromptsInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateWithoutPromptsInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutPromptsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersCreateOrConnectWithoutPromptsInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptsInputSchema) ]),
});

export const Prompt_versionsCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsCreateWithoutPromptInput> = z.strictObject({
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  creator: z.lazy(() => UsersCreateNestedOneWithoutCreated_versionsInputSchema),
  promptVariables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateWithoutPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  created_by: z.number().int(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_versionsCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.Prompt_versionsCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_versionsCreateManyPromptInputSchema), z.lazy(() => Prompt_versionsCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_variablesCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesCreateWithoutPromptInput> = z.strictObject({
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_version: z.lazy(() => Prompt_versionsCreateNestedOneWithoutPromptVariablesInputSchema).optional(),
});

export const Prompt_variablesUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedCreateWithoutPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_version_id: z.number().int(),
});

export const Prompt_variablesCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_variablesCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.Prompt_variablesCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_variablesCreateManyPromptInputSchema), z.lazy(() => Prompt_variablesCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_tagsCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsCreateWithoutPromptInput> = z.strictObject({
  tag: z.lazy(() => TagsCreateNestedOneWithoutPromptsInputSchema),
});

export const Prompt_tagsUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedCreateWithoutPromptInput> = z.strictObject({
  tag_id: z.number().int(),
});

export const Prompt_tagsCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_tagsCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.Prompt_tagsCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_tagsCreateManyPromptInputSchema), z.lazy(() => Prompt_tagsCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Collections_promptsCreateWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsCreateWithoutPromptInput> = z.strictObject({
  sort_order: z.number().int().optional(),
  collection: z.lazy(() => CollectionsCreateNestedOneWithoutPromptsInputSchema),
});

export const Collections_promptsUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedCreateWithoutPromptInput> = z.strictObject({
  collection_id: z.number().int(),
  sort_order: z.number().int().optional(),
});

export const Collections_promptsCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Collections_promptsCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.Collections_promptsCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Collections_promptsCreateManyPromptInputSchema), z.lazy(() => Collections_promptsCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const FavoritesCreateWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesCreateWithoutPromptInput> = z.strictObject({
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutFavoritesInputSchema),
});

export const FavoritesUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUncheckedCreateWithoutPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const FavoritesCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => FavoritesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => FavoritesCreateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema) ]),
});

export const FavoritesCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.FavoritesCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => FavoritesCreateManyPromptInputSchema), z.lazy(() => FavoritesCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_runCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runCreateWithoutPromptInput> = z.strictObject({
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutPromptRunsInputSchema),
  prompt_version: z.lazy(() => Prompt_versionsCreateNestedOneWithoutPromptRunsInputSchema),
});

export const Prompt_runUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateWithoutPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_version_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_runCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.Prompt_runCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_runCreateManyPromptInputSchema), z.lazy(() => Prompt_runCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_commentsCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsCreateWithoutPromptInput> = z.strictObject({
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutCommentsInputSchema),
  parent: z.lazy(() => Prompt_commentsCreateNestedOneWithoutRepliesInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsUncheckedCreateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateWithoutPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  user_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsCreateOrConnectWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsCreateOrConnectWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_commentsCreateManyPromptInputEnvelopeSchema: z.ZodType<Prisma.Prompt_commentsCreateManyPromptInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_commentsCreateManyPromptInputSchema), z.lazy(() => Prompt_commentsCreateManyPromptInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const CategoriesUpsertWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesUpsertWithoutPromptsInput> = z.strictObject({
  update: z.union([ z.lazy(() => CategoriesUpdateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedUpdateWithoutPromptsInputSchema) ]),
  create: z.union([ z.lazy(() => CategoriesCreateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedCreateWithoutPromptsInputSchema) ]),
  where: z.lazy(() => CategoriesWhereInputSchema).optional(),
});

export const CategoriesUpdateToOneWithWhereWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesUpdateToOneWithWhereWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => CategoriesWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CategoriesUpdateWithoutPromptsInputSchema), z.lazy(() => CategoriesUncheckedUpdateWithoutPromptsInputSchema) ]),
});

export const CategoriesUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesUpdateWithoutPromptsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CategoriesUncheckedUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.CategoriesUncheckedUpdateWithoutPromptsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  color: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const UsersUpsertWithoutPromptsInputSchema: z.ZodType<Prisma.UsersUpsertWithoutPromptsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UsersUpdateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutPromptsInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptsInputSchema) ]),
  where: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const UsersUpdateToOneWithWhereWithoutPromptsInputSchema: z.ZodType<Prisma.UsersUpdateToOneWithWhereWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UsersUpdateWithoutPromptsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutPromptsInputSchema) ]),
});

export const UsersUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.UsersUpdateWithoutPromptsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_versions: z.lazy(() => Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutPromptsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const Prompt_versionsUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_versionsUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const Prompt_versionsUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_versionsUpdateManyMutationInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Prompt_variablesUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_variablesUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_variablesUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_variablesUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_variablesUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const Prompt_variablesUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_variablesUpdateManyMutationInputSchema), z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Prompt_variablesScalarWhereInputSchema: z.ZodType<Prisma.Prompt_variablesScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_variablesScalarWhereInputSchema), z.lazy(() => Prompt_variablesScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_variablesScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_variablesScalarWhereInputSchema), z.lazy(() => Prompt_variablesScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  name: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  label: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  type: z.union([ z.lazy(() => StringFilterSchema), z.string() ]).optional(),
  is_required: z.union([ z.lazy(() => BoolFilterSchema), z.boolean() ]).optional(),
  default_value: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  placeholder: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  description: z.union([ z.lazy(() => StringNullableFilterSchema), z.string() ]).optional().nullable(),
  options_json: z.lazy(() => JsonNullableFilterSchema).optional(),
  sort_order: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  created_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  updated_at: z.union([ z.lazy(() => DateTimeFilterSchema), z.coerce.date() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_version_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export const Prompt_tagsUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_tagsUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_tagsUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_tagsUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_tagsUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const Prompt_tagsUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_tagsUpdateManyMutationInputSchema), z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Prompt_tagsScalarWhereInputSchema: z.ZodType<Prisma.Prompt_tagsScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Prompt_tagsScalarWhereInputSchema), z.lazy(() => Prompt_tagsScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Prompt_tagsScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Prompt_tagsScalarWhereInputSchema), z.lazy(() => Prompt_tagsScalarWhereInputSchema).array() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  tag_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export const Collections_promptsUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Collections_promptsUpdateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Collections_promptsUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Collections_promptsUpdateWithoutPromptInputSchema), z.lazy(() => Collections_promptsUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const Collections_promptsUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Collections_promptsUpdateManyMutationInputSchema), z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Collections_promptsScalarWhereInputSchema: z.ZodType<Prisma.Collections_promptsScalarWhereInput> = z.strictObject({
  AND: z.union([ z.lazy(() => Collections_promptsScalarWhereInputSchema), z.lazy(() => Collections_promptsScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => Collections_promptsScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => Collections_promptsScalarWhereInputSchema), z.lazy(() => Collections_promptsScalarWhereInputSchema).array() ]).optional(),
  collection_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  prompt_id: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
  sort_order: z.union([ z.lazy(() => IntFilterSchema), z.number() ]).optional(),
});

export const FavoritesUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => FavoritesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => FavoritesUpdateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => FavoritesCreateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedCreateWithoutPromptInputSchema) ]),
});

export const FavoritesUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => FavoritesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => FavoritesUpdateWithoutPromptInputSchema), z.lazy(() => FavoritesUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const FavoritesUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => FavoritesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => FavoritesUpdateManyMutationInputSchema), z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Prompt_runUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_runUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_runUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_runUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const Prompt_runUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_runScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_runUpdateManyMutationInputSchema), z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Prompt_commentsUpsertWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUpsertWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutPromptInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutPromptInputSchema) ]),
});

export const Prompt_commentsUpdateWithWhereUniqueWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithWhereUniqueWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutPromptInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutPromptInputSchema) ]),
});

export const Prompt_commentsUpdateManyWithWhereWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyWithWhereWithoutPromptInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateManyMutationInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptInputSchema) ]),
});

export const Prompt_tagsCreateWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsCreateWithoutTagInput> = z.strictObject({
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutTagsInputSchema),
});

export const Prompt_tagsUncheckedCreateWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedCreateWithoutTagInput> = z.strictObject({
  prompt_id: z.number().int(),
});

export const Prompt_tagsCreateOrConnectWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsCreateOrConnectWithoutTagInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema) ]),
});

export const Prompt_tagsCreateManyTagInputEnvelopeSchema: z.ZodType<Prisma.Prompt_tagsCreateManyTagInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_tagsCreateManyTagInputSchema), z.lazy(() => Prompt_tagsCreateManyTagInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_tagsUpsertWithWhereUniqueWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUpsertWithWhereUniqueWithoutTagInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_tagsUpdateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedUpdateWithoutTagInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_tagsCreateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedCreateWithoutTagInputSchema) ]),
});

export const Prompt_tagsUpdateWithWhereUniqueWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateWithWhereUniqueWithoutTagInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_tagsUpdateWithoutTagInputSchema), z.lazy(() => Prompt_tagsUncheckedUpdateWithoutTagInputSchema) ]),
});

export const Prompt_tagsUpdateManyWithWhereWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyWithWhereWithoutTagInput> = z.strictObject({
  where: z.lazy(() => Prompt_tagsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_tagsUpdateManyMutationInputSchema), z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutTagInputSchema) ]),
});

export const PromptsCreateWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsCreateWithoutVersionsInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutVersionsInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutVersionsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVersionsInputSchema) ]),
});

export const UsersCreateWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersCreateWithoutCreated_versionsInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutOwnerInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutCreated_versionsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersCreateOrConnectWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutCreated_versionsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCreated_versionsInputSchema) ]),
});

export const Prompt_variablesCreateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesCreateWithoutPrompt_versionInput> = z.strictObject({
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutVariablesInputSchema),
});

export const Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedCreateWithoutPrompt_versionInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_id: z.number().int(),
});

export const Prompt_variablesCreateOrConnectWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesCreateOrConnectWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_variablesCreateManyPrompt_versionInputEnvelopeSchema: z.ZodType<Prisma.Prompt_variablesCreateManyPrompt_versionInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_variablesCreateManyPrompt_versionInputSchema), z.lazy(() => Prompt_variablesCreateManyPrompt_versionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Prompt_runCreateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runCreateWithoutPrompt_versionInput> = z.strictObject({
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  user: z.lazy(() => UsersCreateNestedOneWithoutPromptRunsInputSchema),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutPromptRunsInputSchema),
});

export const Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUncheckedCreateWithoutPrompt_versionInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runCreateOrConnectWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runCreateOrConnectWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_runCreateManyPrompt_versionInputEnvelopeSchema: z.ZodType<Prisma.Prompt_runCreateManyPrompt_versionInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_runCreateManyPrompt_versionInputSchema), z.lazy(() => Prompt_runCreateManyPrompt_versionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PromptsUpsertWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutVersionsInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutVersionsInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVersionsInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutVersionsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutVersionsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutVersionsInputSchema) ]),
});

export const PromptsUpdateWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutVersionsInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutVersionsInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutVersionsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const UsersUpsertWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersUpsertWithoutCreated_versionsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UsersUpdateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutCreated_versionsInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCreated_versionsInputSchema) ]),
  where: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const UsersUpdateToOneWithWhereWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersUpdateToOneWithWhereWithoutCreated_versionsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UsersUpdateWithoutCreated_versionsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutCreated_versionsInputSchema) ]),
});

export const UsersUpdateWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersUpdateWithoutCreated_versionsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutOwnerNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateWithoutCreated_versionsInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutCreated_versionsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const Prompt_variablesUpsertWithWhereUniqueWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUpsertWithWhereUniqueWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_variablesUpdateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedUpdateWithoutPrompt_versionInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_variablesCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedCreateWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_variablesUpdateWithWhereUniqueWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateWithWhereUniqueWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_variablesUpdateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_variablesUncheckedUpdateWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_variablesUpdateManyWithWhereWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyWithWhereWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_variablesScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_variablesUpdateManyMutationInputSchema), z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_runUpsertWithWhereUniqueWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUpsertWithWhereUniqueWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_runUpdateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedUpdateWithoutPrompt_versionInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_runCreateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedCreateWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_runUpdateWithWhereUniqueWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUpdateWithWhereUniqueWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_runWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_runUpdateWithoutPrompt_versionInputSchema), z.lazy(() => Prompt_runUncheckedUpdateWithoutPrompt_versionInputSchema) ]),
});

export const Prompt_runUpdateManyWithWhereWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUpdateManyWithWhereWithoutPrompt_versionInput> = z.strictObject({
  where: z.lazy(() => Prompt_runScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_runUpdateManyMutationInputSchema), z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPrompt_versionInputSchema) ]),
});

export const PromptsCreateWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsCreateWithoutVariablesInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutVariablesInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutVariablesInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVariablesInputSchema) ]),
});

export const Prompt_versionsCreateWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsCreateWithoutPromptVariablesInput> = z.strictObject({
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutVersionsInputSchema),
  creator: z.lazy(() => UsersCreateNestedOneWithoutCreated_versionsInputSchema),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsUncheckedCreateWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateWithoutPromptVariablesInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt_id: z.number().int(),
  created_by: z.number().int(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsCreateOrConnectWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsCreateOrConnectWithoutPromptVariablesInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptVariablesInputSchema) ]),
});

export const PromptsUpsertWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutVariablesInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutVariablesInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutVariablesInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutVariablesInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutVariablesInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutVariablesInputSchema) ]),
});

export const PromptsUpdateWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutVariablesInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutVariablesInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutVariablesInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const Prompt_versionsUpsertWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsUpsertWithoutPromptVariablesInput> = z.strictObject({
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptVariablesInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptVariablesInputSchema) ]),
  where: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
});

export const Prompt_versionsUpdateToOneWithWhereWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateToOneWithWhereWithoutPromptVariablesInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutPromptVariablesInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptVariablesInputSchema) ]),
});

export const Prompt_versionsUpdateWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateWithoutPromptVariablesInput> = z.strictObject({
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutVersionsNestedInputSchema).optional(),
  creator: z.lazy(() => UsersUpdateOneRequiredWithoutCreated_versionsNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateWithoutPromptVariablesInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateWithoutPromptVariablesInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_by: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const PromptsCreateWithoutTagsInputSchema: z.ZodType<Prisma.PromptsCreateWithoutTagsInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutTagsInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutTagsInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutTagsInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutTagsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutTagsInputSchema) ]),
});

export const TagsCreateWithoutPromptsInputSchema: z.ZodType<Prisma.TagsCreateWithoutPromptsInput> = z.strictObject({
  name: z.string(),
  created_at: z.coerce.date().optional(),
});

export const TagsUncheckedCreateWithoutPromptsInputSchema: z.ZodType<Prisma.TagsUncheckedCreateWithoutPromptsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  created_at: z.coerce.date().optional(),
});

export const TagsCreateOrConnectWithoutPromptsInputSchema: z.ZodType<Prisma.TagsCreateOrConnectWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => TagsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TagsCreateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedCreateWithoutPromptsInputSchema) ]),
});

export const PromptsUpsertWithoutTagsInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutTagsInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutTagsInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutTagsInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutTagsInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutTagsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutTagsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutTagsInputSchema) ]),
});

export const PromptsUpdateWithoutTagsInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutTagsInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutTagsInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutTagsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const TagsUpsertWithoutPromptsInputSchema: z.ZodType<Prisma.TagsUpsertWithoutPromptsInput> = z.strictObject({
  update: z.union([ z.lazy(() => TagsUpdateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedUpdateWithoutPromptsInputSchema) ]),
  create: z.union([ z.lazy(() => TagsCreateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedCreateWithoutPromptsInputSchema) ]),
  where: z.lazy(() => TagsWhereInputSchema).optional(),
});

export const TagsUpdateToOneWithWhereWithoutPromptsInputSchema: z.ZodType<Prisma.TagsUpdateToOneWithWhereWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => TagsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => TagsUpdateWithoutPromptsInputSchema), z.lazy(() => TagsUncheckedUpdateWithoutPromptsInputSchema) ]),
});

export const TagsUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.TagsUpdateWithoutPromptsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const TagsUncheckedUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.TagsUncheckedUpdateWithoutPromptsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsCreateWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsCreateWithoutCollectionInput> = z.strictObject({
  sort_order: z.number().int().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutCollectionsInputSchema),
});

export const Collections_promptsUncheckedCreateWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedCreateWithoutCollectionInput> = z.strictObject({
  prompt_id: z.number().int(),
  sort_order: z.number().int().optional(),
});

export const Collections_promptsCreateOrConnectWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsCreateOrConnectWithoutCollectionInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema) ]),
});

export const Collections_promptsCreateManyCollectionInputEnvelopeSchema: z.ZodType<Prisma.Collections_promptsCreateManyCollectionInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Collections_promptsCreateManyCollectionInputSchema), z.lazy(() => Collections_promptsCreateManyCollectionInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const Collections_promptsUpsertWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUpsertWithWhereUniqueWithoutCollectionInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Collections_promptsUpdateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedUpdateWithoutCollectionInputSchema) ]),
  create: z.union([ z.lazy(() => Collections_promptsCreateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedCreateWithoutCollectionInputSchema) ]),
});

export const Collections_promptsUpdateWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUpdateWithWhereUniqueWithoutCollectionInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Collections_promptsUpdateWithoutCollectionInputSchema), z.lazy(() => Collections_promptsUncheckedUpdateWithoutCollectionInputSchema) ]),
});

export const Collections_promptsUpdateManyWithWhereWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUpdateManyWithWhereWithoutCollectionInput> = z.strictObject({
  where: z.lazy(() => Collections_promptsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Collections_promptsUpdateManyMutationInputSchema), z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutCollectionInputSchema) ]),
});

export const CollectionsCreateWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsCreateWithoutPromptsInput> = z.strictObject({
  name: z.string(),
  description: z.string().optional().nullable(),
  visibility: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CollectionsUncheckedCreateWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsUncheckedCreateWithoutPromptsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  description: z.string().optional().nullable(),
  visibility: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const CollectionsCreateOrConnectWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsCreateOrConnectWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => CollectionsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CollectionsCreateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedCreateWithoutPromptsInputSchema) ]),
});

export const PromptsCreateWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsCreateWithoutCollectionsInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutCollectionsInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutCollectionsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCollectionsInputSchema) ]),
});

export const CollectionsUpsertWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsUpsertWithoutPromptsInput> = z.strictObject({
  update: z.union([ z.lazy(() => CollectionsUpdateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedUpdateWithoutPromptsInputSchema) ]),
  create: z.union([ z.lazy(() => CollectionsCreateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedCreateWithoutPromptsInputSchema) ]),
  where: z.lazy(() => CollectionsWhereInputSchema).optional(),
});

export const CollectionsUpdateToOneWithWhereWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsUpdateToOneWithWhereWithoutPromptsInput> = z.strictObject({
  where: z.lazy(() => CollectionsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => CollectionsUpdateWithoutPromptsInputSchema), z.lazy(() => CollectionsUncheckedUpdateWithoutPromptsInputSchema) ]),
});

export const CollectionsUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsUpdateWithoutPromptsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const CollectionsUncheckedUpdateWithoutPromptsInputSchema: z.ZodType<Prisma.CollectionsUncheckedUpdateWithoutPromptsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PromptsUpsertWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutCollectionsInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCollectionsInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCollectionsInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutCollectionsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutCollectionsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCollectionsInputSchema) ]),
});

export const PromptsUpdateWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutCollectionsInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutCollectionsInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutCollectionsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const UsersCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersCreateWithoutFavoritesInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutCreatorInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutFavoritesInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedCreateWithoutFavoritesInputSchema) ]),
});

export const PromptsCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsCreateWithoutFavoritesInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutFavoritesInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutFavoritesInputSchema) ]),
});

export const UsersUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersUpsertWithoutFavoritesInput> = z.strictObject({
  update: z.union([ z.lazy(() => UsersUpdateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const UsersUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersUpdateToOneWithWhereWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => UsersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UsersUpdateWithoutFavoritesInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutFavoritesInputSchema) ]),
});

export const UsersUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersUpdateWithoutFavoritesInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutFavoritesInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const PromptsUpsertWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutFavoritesInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutFavoritesInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutFavoritesInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutFavoritesInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutFavoritesInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutFavoritesInputSchema) ]),
});

export const PromptsUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutFavoritesInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutFavoritesInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutFavoritesInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const UsersCreateWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersCreateWithoutPromptRunsInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutPromptRunsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersCreateOrConnectWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutPromptRunsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptRunsInputSchema) ]),
});

export const PromptsCreateWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsCreateWithoutPromptRunsInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutPromptRunsInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutPromptRunsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutPromptRunsInputSchema) ]),
});

export const Prompt_versionsCreateWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsCreateWithoutPromptRunsInput> = z.strictObject({
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutVersionsInputSchema),
  creator: z.lazy(() => UsersCreateNestedOneWithoutCreated_versionsInputSchema),
  promptVariables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsUncheckedCreateWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedCreateWithoutPromptRunsInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt_id: z.number().int(),
  created_by: z.number().int(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPrompt_versionInputSchema).optional(),
});

export const Prompt_versionsCreateOrConnectWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsCreateOrConnectWithoutPromptRunsInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptRunsInputSchema) ]),
});

export const UsersUpsertWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersUpsertWithoutPromptRunsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UsersUpdateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutPromptRunsInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutPromptRunsInputSchema) ]),
  where: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const UsersUpdateToOneWithWhereWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersUpdateToOneWithWhereWithoutPromptRunsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UsersUpdateWithoutPromptRunsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutPromptRunsInputSchema) ]),
});

export const UsersUpdateWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersUpdateWithoutPromptRunsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateWithoutPromptRunsInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutPromptRunsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const PromptsUpsertWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutPromptRunsInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutPromptRunsInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutPromptRunsInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutPromptRunsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutPromptRunsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutPromptRunsInputSchema) ]),
});

export const PromptsUpdateWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutPromptRunsInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutPromptRunsInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutPromptRunsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const Prompt_versionsUpsertWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsUpsertWithoutPromptRunsInput> = z.strictObject({
  update: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptRunsInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_versionsCreateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedCreateWithoutPromptRunsInputSchema) ]),
  where: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
});

export const Prompt_versionsUpdateToOneWithWhereWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateToOneWithWhereWithoutPromptRunsInput> = z.strictObject({
  where: z.lazy(() => Prompt_versionsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => Prompt_versionsUpdateWithoutPromptRunsInputSchema), z.lazy(() => Prompt_versionsUncheckedUpdateWithoutPromptRunsInputSchema) ]),
});

export const Prompt_versionsUpdateWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateWithoutPromptRunsInput> = z.strictObject({
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutVersionsNestedInputSchema).optional(),
  creator: z.lazy(() => UsersUpdateOneRequiredWithoutCreated_versionsNestedInputSchema).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateWithoutPromptRunsInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateWithoutPromptRunsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_by: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const UsersCreateWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersCreateWithoutActivityLogsInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutActivityLogsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersCreateOrConnectWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutActivityLogsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutActivityLogsInputSchema) ]),
});

export const UsersUpsertWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersUpsertWithoutActivityLogsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UsersUpdateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutActivityLogsInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutActivityLogsInputSchema) ]),
  where: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const UsersUpdateToOneWithWhereWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersUpdateToOneWithWhereWithoutActivityLogsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UsersUpdateWithoutActivityLogsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutActivityLogsInputSchema) ]),
});

export const UsersUpdateWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersUpdateWithoutActivityLogsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateWithoutActivityLogsInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutActivityLogsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const PromptsCreateWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsCreateWithoutCommentsInput> = z.strictObject({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category: z.lazy(() => CategoriesCreateNestedOneWithoutPromptsInputSchema).optional(),
  owner: z.lazy(() => UsersCreateNestedOneWithoutPromptsInputSchema),
  versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsUncheckedCreateWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsUncheckedCreateWithoutCommentsInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
  owner_id: z.number().int(),
  versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutPromptInputSchema).optional(),
});

export const PromptsCreateOrConnectWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsCreateOrConnectWithoutCommentsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PromptsCreateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCommentsInputSchema) ]),
});

export const UsersCreateWithoutCommentsInputSchema: z.ZodType<Prisma.UsersCreateWithoutCommentsInput> = z.strictObject({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersUncheckedCreateWithoutCommentsInputSchema: z.ZodType<Prisma.UsersUncheckedCreateWithoutCommentsInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.string().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  status: z.lazy(() => UserStatusSchema).optional(),
  prompts: z.lazy(() => PromptsUncheckedCreateNestedManyWithoutOwnerInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedCreateNestedManyWithoutCreatorInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedCreateNestedManyWithoutUserInputSchema).optional(),
});

export const UsersCreateOrConnectWithoutCommentsInputSchema: z.ZodType<Prisma.UsersCreateOrConnectWithoutCommentsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => UsersCreateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCommentsInputSchema) ]),
});

export const Prompt_commentsCreateWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsCreateWithoutRepliesInput> = z.strictObject({
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UsersCreateNestedOneWithoutCommentsInputSchema),
  parent: z.lazy(() => Prompt_commentsCreateNestedOneWithoutRepliesInputSchema).optional(),
});

export const Prompt_commentsUncheckedCreateWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateWithoutRepliesInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_commentsCreateOrConnectWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsCreateOrConnectWithoutRepliesInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutRepliesInputSchema) ]),
});

export const Prompt_commentsCreateWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsCreateWithoutParentInput> = z.strictObject({
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt: z.lazy(() => PromptsCreateNestedOneWithoutCommentsInputSchema),
  user: z.lazy(() => UsersCreateNestedOneWithoutCommentsInputSchema),
  replies: z.lazy(() => Prompt_commentsCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsUncheckedCreateWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedCreateWithoutParentInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
});

export const Prompt_commentsCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsCreateOrConnectWithoutParentInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema) ]),
});

export const Prompt_commentsCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.Prompt_commentsCreateManyParentInputEnvelope> = z.strictObject({
  data: z.union([ z.lazy(() => Prompt_commentsCreateManyParentInputSchema), z.lazy(() => Prompt_commentsCreateManyParentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional(),
});

export const PromptsUpsertWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsUpsertWithoutCommentsInput> = z.strictObject({
  update: z.union([ z.lazy(() => PromptsUpdateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCommentsInputSchema) ]),
  create: z.union([ z.lazy(() => PromptsCreateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedCreateWithoutCommentsInputSchema) ]),
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
});

export const PromptsUpdateToOneWithWhereWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsUpdateToOneWithWhereWithoutCommentsInput> = z.strictObject({
  where: z.lazy(() => PromptsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => PromptsUpdateWithoutCommentsInputSchema), z.lazy(() => PromptsUncheckedUpdateWithoutCommentsInputSchema) ]),
});

export const PromptsUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutCommentsInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutCommentsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const UsersUpsertWithoutCommentsInputSchema: z.ZodType<Prisma.UsersUpsertWithoutCommentsInput> = z.strictObject({
  update: z.union([ z.lazy(() => UsersUpdateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutCommentsInputSchema) ]),
  create: z.union([ z.lazy(() => UsersCreateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedCreateWithoutCommentsInputSchema) ]),
  where: z.lazy(() => UsersWhereInputSchema).optional(),
});

export const UsersUpdateToOneWithWhereWithoutCommentsInputSchema: z.ZodType<Prisma.UsersUpdateToOneWithWhereWithoutCommentsInput> = z.strictObject({
  where: z.lazy(() => UsersWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => UsersUpdateWithoutCommentsInputSchema), z.lazy(() => UsersUncheckedUpdateWithoutCommentsInputSchema) ]),
});

export const UsersUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.UsersUpdateWithoutCommentsInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const UsersUncheckedUpdateWithoutCommentsInputSchema: z.ZodType<Prisma.UsersUncheckedUpdateWithoutCommentsInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  email: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  password: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.lazy(() => UserStatusSchema), z.lazy(() => EnumUserStatusFieldUpdateOperationsInputSchema) ]).optional(),
  prompts: z.lazy(() => PromptsUncheckedUpdateManyWithoutOwnerNestedInputSchema).optional(),
  created_versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutCreatorNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
  activityLogs: z.lazy(() => Activity_logUncheckedUpdateManyWithoutUserNestedInputSchema).optional(),
});

export const Prompt_commentsUpsertWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsUpsertWithoutRepliesInput> = z.strictObject({
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutRepliesInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutRepliesInputSchema) ]),
  where: z.lazy(() => Prompt_commentsWhereInputSchema).optional(),
});

export const Prompt_commentsUpdateToOneWithWhereWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateToOneWithWhereWithoutRepliesInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutRepliesInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutRepliesInputSchema) ]),
});

export const Prompt_commentsUpdateWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithoutRepliesInput> = z.strictObject({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  parent: z.lazy(() => Prompt_commentsUpdateOneWithoutRepliesNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateWithoutRepliesInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateWithoutRepliesInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_commentsUpsertWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUpsertWithWhereUniqueWithoutParentInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutParentInputSchema) ]),
  create: z.union([ z.lazy(() => Prompt_commentsCreateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedCreateWithoutParentInputSchema) ]),
});

export const Prompt_commentsUpdateWithWhereUniqueWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithWhereUniqueWithoutParentInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateWithoutParentInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateWithoutParentInputSchema) ]),
});

export const Prompt_commentsUpdateManyWithWhereWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyWithWhereWithoutParentInput> = z.strictObject({
  where: z.lazy(() => Prompt_commentsScalarWhereInputSchema),
  data: z.union([ z.lazy(() => Prompt_commentsUpdateManyMutationInputSchema), z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutParentInputSchema) ]),
});

export const PromptsCreateManyOwnerInputSchema: z.ZodType<Prisma.PromptsCreateManyOwnerInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  category_id: z.number().int().optional().nullable(),
});

export const Prompt_versionsCreateManyCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsCreateManyCreatorInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  prompt_id: z.number().int(),
});

export const FavoritesCreateManyUserInputSchema: z.ZodType<Prisma.FavoritesCreateManyUserInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runCreateManyUserInputSchema: z.ZodType<Prisma.Prompt_runCreateManyUserInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  prompt_version_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Activity_logCreateManyUserInputSchema: z.ZodType<Prisma.Activity_logCreateManyUserInput> = z.strictObject({
  id: z.number().int().optional(),
  action: z.string(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.coerce.date().optional(),
});

export const Prompt_commentsCreateManyUserInputSchema: z.ZodType<Prisma.Prompt_commentsCreateManyUserInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const PromptsUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutOwnerInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category: z.lazy(() => CategoriesUpdateOneWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutOwnerInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateManyWithoutOwnerInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateManyWithoutOwnerInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  category_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
});

export const Prompt_versionsUpdateWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateWithoutCreatorInput> = z.strictObject({
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutVersionsNestedInputSchema).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateWithoutCreatorInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateManyWithoutCreatorInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateManyWithoutCreatorInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesUpdateWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUpdateWithoutUserInput> = z.strictObject({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
});

export const FavoritesUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUpdateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUpdateWithoutUserInput> = z.strictObject({
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
  prompt_version: z.lazy(() => Prompt_versionsUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
});

export const Prompt_runUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Activity_logUpdateWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUpdateWithoutUserInput> = z.strictObject({
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Activity_logUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Activity_logUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.Activity_logUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  action: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  details: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_commentsUpdateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithoutUserInput> = z.strictObject({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  parent: z.lazy(() => Prompt_commentsUpdateOneWithoutRepliesNestedInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateManyWithoutUserInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyWithoutUserInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const PromptsCreateManyCategoryInputSchema: z.ZodType<Prisma.PromptsCreateManyCategoryInput> = z.strictObject({
  id: z.number().int().optional(),
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  visibility: z.string().optional(),
  latest_version_no: z.number().int().optional(),
  recommended_model: z.string().optional().nullable(),
  is_template_active: z.boolean().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional().nullable(),
  owner_id: z.number().int(),
});

export const PromptsUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUpdateWithoutCategoryInput> = z.strictObject({
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner: z.lazy(() => UsersUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
  versions: z.lazy(() => Prompt_versionsUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  versions: z.lazy(() => Prompt_versionsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  variables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  tags: z.lazy(() => Prompt_tagsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  collections: z.lazy(() => Collections_promptsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  favorites: z.lazy(() => FavoritesUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
  comments: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutPromptNestedInputSchema).optional(),
});

export const PromptsUncheckedUpdateManyWithoutCategoryInputSchema: z.ZodType<Prisma.PromptsUncheckedUpdateManyWithoutCategoryInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  title: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  visibility: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  latest_version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  recommended_model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  is_template_active: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deleted_at: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  owner_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_versionsCreateManyPromptInputSchema: z.ZodType<Prisma.Prompt_versionsCreateManyPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  version_no: z.number().int(),
  template_content: z.string(),
  system_prompt: z.string().optional().nullable(),
  output_format: z.string().optional().nullable(),
  changelog: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  status: z.string().optional(),
  created_by: z.number().int(),
});

export const Prompt_variablesCreateManyPromptInputSchema: z.ZodType<Prisma.Prompt_variablesCreateManyPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_version_id: z.number().int(),
});

export const Prompt_tagsCreateManyPromptInputSchema: z.ZodType<Prisma.Prompt_tagsCreateManyPromptInput> = z.strictObject({
  tag_id: z.number().int(),
});

export const Collections_promptsCreateManyPromptInputSchema: z.ZodType<Prisma.Collections_promptsCreateManyPromptInput> = z.strictObject({
  collection_id: z.number().int(),
  sort_order: z.number().int().optional(),
});

export const FavoritesCreateManyPromptInputSchema: z.ZodType<Prisma.FavoritesCreateManyPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  user_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_runCreateManyPromptInputSchema: z.ZodType<Prisma.Prompt_runCreateManyPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_version_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_commentsCreateManyPromptInputSchema: z.ZodType<Prisma.Prompt_commentsCreateManyPromptInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  user_id: z.number().int(),
  parent_id: z.number().int().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_versionsUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUpdateWithoutPromptInput> = z.strictObject({
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  creator: z.lazy(() => UsersUpdateOneRequiredWithoutCreated_versionsNestedInputSchema).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_by: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  promptVariables: z.lazy(() => Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
  promptRuns: z.lazy(() => Prompt_runUncheckedUpdateManyWithoutPrompt_versionNestedInputSchema).optional(),
});

export const Prompt_versionsUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_versionsUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  version_no: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  template_content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  system_prompt: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  output_format: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  changelog: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  created_by: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateWithoutPromptInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version: z.lazy(() => Prompt_versionsUpdateOneWithoutPromptVariablesNestedInputSchema).optional(),
});

export const Prompt_variablesUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_tagsUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateWithoutPromptInput> = z.strictObject({
  tag: z.lazy(() => TagsUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
});

export const Prompt_tagsUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateWithoutPromptInput> = z.strictObject({
  tag_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_tagsUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  tag_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUpdateWithoutPromptInput> = z.strictObject({
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  collection: z.lazy(() => CollectionsUpdateOneRequiredWithoutPromptsNestedInputSchema).optional(),
});

export const Collections_promptsUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateWithoutPromptInput> = z.strictObject({
  collection_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  collection_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesUpdateWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUpdateWithoutPromptInput> = z.strictObject({
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
});

export const FavoritesUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const FavoritesUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.FavoritesUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUpdateWithoutPromptInput> = z.strictObject({
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
  prompt_version: z.lazy(() => Prompt_versionsUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
});

export const Prompt_runUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_version_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_commentsUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithoutPromptInput> = z.strictObject({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  parent: z.lazy(() => Prompt_commentsUpdateOneWithoutRepliesNestedInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateManyWithoutPromptInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyWithoutPromptInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  parent_id: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_tagsCreateManyTagInputSchema: z.ZodType<Prisma.Prompt_tagsCreateManyTagInput> = z.strictObject({
  prompt_id: z.number().int(),
});

export const Prompt_tagsUpdateWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUpdateWithoutTagInput> = z.strictObject({
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutTagsNestedInputSchema).optional(),
});

export const Prompt_tagsUncheckedUpdateWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateWithoutTagInput> = z.strictObject({
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_tagsUncheckedUpdateManyWithoutTagInputSchema: z.ZodType<Prisma.Prompt_tagsUncheckedUpdateManyWithoutTagInput> = z.strictObject({
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesCreateManyPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesCreateManyPrompt_versionInput> = z.strictObject({
  id: z.number().int().optional(),
  name: z.string(),
  label: z.string(),
  type: z.string(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional().nullable(),
  placeholder: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.number().int().optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  prompt_id: z.number().int(),
});

export const Prompt_runCreateManyPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runCreateManyPrompt_versionInput> = z.strictObject({
  id: z.number().int().optional(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  rendered_prompt: z.string(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.string().optional().nullable(),
  execution_time_ms: z.number().int().optional().nullable(),
  token_used: z.number().optional(),
  model: z.string().optional().nullable(),
  status: z.string().optional(),
  error_message: z.string().optional().nullable(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_variablesUpdateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUpdateWithoutPrompt_versionInput> = z.strictObject({
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutVariablesNestedInputSchema).optional(),
});

export const Prompt_variablesUncheckedUpdateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateWithoutPrompt_versionInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_variablesUncheckedUpdateManyWithoutPrompt_versionInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  label: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  type: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  is_required: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  default_value: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  placeholder: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  description: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  options_json: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUpdateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUpdateWithoutPrompt_versionInput> = z.strictObject({
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutPromptRunsNestedInputSchema).optional(),
});

export const Prompt_runUncheckedUpdateWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateWithoutPrompt_versionInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_runUncheckedUpdateManyWithoutPrompt_versionInputSchema: z.ZodType<Prisma.Prompt_runUncheckedUpdateManyWithoutPrompt_versionInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  rendered_prompt: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  variables_input: z.union([ z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema ]).optional(),
  output_response: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  execution_time_ms: z.union([ z.number().int(),z.lazy(() => NullableIntFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  token_used: z.union([ z.number(),z.lazy(() => FloatFieldUpdateOperationsInputSchema) ]).optional(),
  model: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  status: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  error_message: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsCreateManyCollectionInputSchema: z.ZodType<Prisma.Collections_promptsCreateManyCollectionInput> = z.strictObject({
  prompt_id: z.number().int(),
  sort_order: z.number().int().optional(),
});

export const Collections_promptsUpdateWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUpdateWithoutCollectionInput> = z.strictObject({
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutCollectionsNestedInputSchema).optional(),
});

export const Collections_promptsUncheckedUpdateWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateWithoutCollectionInput> = z.strictObject({
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Collections_promptsUncheckedUpdateManyWithoutCollectionInputSchema: z.ZodType<Prisma.Collections_promptsUncheckedUpdateManyWithoutCollectionInput> = z.strictObject({
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  sort_order: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
});

export const Prompt_commentsCreateManyParentInputSchema: z.ZodType<Prisma.Prompt_commentsCreateManyParentInput> = z.strictObject({
  id: z.number().int().optional(),
  content: z.string(),
  attachment_url: z.string().optional().nullable(),
  prompt_id: z.number().int(),
  user_id: z.number().int(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export const Prompt_commentsUpdateWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUpdateWithoutParentInput> = z.strictObject({
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  prompt: z.lazy(() => PromptsUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  user: z.lazy(() => UsersUpdateOneRequiredWithoutCommentsNestedInputSchema).optional(),
  replies: z.lazy(() => Prompt_commentsUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateWithoutParentInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  replies: z.lazy(() => Prompt_commentsUncheckedUpdateManyWithoutParentNestedInputSchema).optional(),
});

export const Prompt_commentsUncheckedUpdateManyWithoutParentInputSchema: z.ZodType<Prisma.Prompt_commentsUncheckedUpdateManyWithoutParentInput> = z.strictObject({
  id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  content: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  attachment_url: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  prompt_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  user_id: z.union([ z.number().int(),z.lazy(() => IntFieldUpdateOperationsInputSchema) ]).optional(),
  created_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updated_at: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
});

/////////////////////////////////////////
// ARGS
/////////////////////////////////////////

export const UsersFindFirstArgsSchema: z.ZodType<Prisma.UsersFindFirstArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereInputSchema.optional(), 
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(), UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UsersScalarFieldEnumSchema, UsersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UsersFindFirstOrThrowArgsSchema: z.ZodType<Prisma.UsersFindFirstOrThrowArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereInputSchema.optional(), 
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(), UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UsersScalarFieldEnumSchema, UsersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UsersFindManyArgsSchema: z.ZodType<Prisma.UsersFindManyArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereInputSchema.optional(), 
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(), UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ UsersScalarFieldEnumSchema, UsersScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const UsersAggregateArgsSchema: z.ZodType<Prisma.UsersAggregateArgs> = z.object({
  where: UsersWhereInputSchema.optional(), 
  orderBy: z.union([ UsersOrderByWithRelationInputSchema.array(), UsersOrderByWithRelationInputSchema ]).optional(),
  cursor: UsersWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UsersGroupByArgsSchema: z.ZodType<Prisma.UsersGroupByArgs> = z.object({
  where: UsersWhereInputSchema.optional(), 
  orderBy: z.union([ UsersOrderByWithAggregationInputSchema.array(), UsersOrderByWithAggregationInputSchema ]).optional(),
  by: UsersScalarFieldEnumSchema.array(), 
  having: UsersScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const UsersFindUniqueArgsSchema: z.ZodType<Prisma.UsersFindUniqueArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema, 
}).strict();

export const UsersFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.UsersFindUniqueOrThrowArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema, 
}).strict();

export const CategoriesFindFirstArgsSchema: z.ZodType<Prisma.CategoriesFindFirstArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereInputSchema.optional(), 
  orderBy: z.union([ CategoriesOrderByWithRelationInputSchema.array(), CategoriesOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoriesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoriesScalarFieldEnumSchema, CategoriesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CategoriesFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CategoriesFindFirstOrThrowArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereInputSchema.optional(), 
  orderBy: z.union([ CategoriesOrderByWithRelationInputSchema.array(), CategoriesOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoriesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoriesScalarFieldEnumSchema, CategoriesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CategoriesFindManyArgsSchema: z.ZodType<Prisma.CategoriesFindManyArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereInputSchema.optional(), 
  orderBy: z.union([ CategoriesOrderByWithRelationInputSchema.array(), CategoriesOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoriesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CategoriesScalarFieldEnumSchema, CategoriesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CategoriesAggregateArgsSchema: z.ZodType<Prisma.CategoriesAggregateArgs> = z.object({
  where: CategoriesWhereInputSchema.optional(), 
  orderBy: z.union([ CategoriesOrderByWithRelationInputSchema.array(), CategoriesOrderByWithRelationInputSchema ]).optional(),
  cursor: CategoriesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CategoriesGroupByArgsSchema: z.ZodType<Prisma.CategoriesGroupByArgs> = z.object({
  where: CategoriesWhereInputSchema.optional(), 
  orderBy: z.union([ CategoriesOrderByWithAggregationInputSchema.array(), CategoriesOrderByWithAggregationInputSchema ]).optional(),
  by: CategoriesScalarFieldEnumSchema.array(), 
  having: CategoriesScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CategoriesFindUniqueArgsSchema: z.ZodType<Prisma.CategoriesFindUniqueArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereUniqueInputSchema, 
}).strict();

export const CategoriesFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CategoriesFindUniqueOrThrowArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereUniqueInputSchema, 
}).strict();

export const PromptsFindFirstArgsSchema: z.ZodType<Prisma.PromptsFindFirstArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereInputSchema.optional(), 
  orderBy: z.union([ PromptsOrderByWithRelationInputSchema.array(), PromptsOrderByWithRelationInputSchema ]).optional(),
  cursor: PromptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PromptsScalarFieldEnumSchema, PromptsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PromptsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.PromptsFindFirstOrThrowArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereInputSchema.optional(), 
  orderBy: z.union([ PromptsOrderByWithRelationInputSchema.array(), PromptsOrderByWithRelationInputSchema ]).optional(),
  cursor: PromptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PromptsScalarFieldEnumSchema, PromptsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PromptsFindManyArgsSchema: z.ZodType<Prisma.PromptsFindManyArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereInputSchema.optional(), 
  orderBy: z.union([ PromptsOrderByWithRelationInputSchema.array(), PromptsOrderByWithRelationInputSchema ]).optional(),
  cursor: PromptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ PromptsScalarFieldEnumSchema, PromptsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const PromptsAggregateArgsSchema: z.ZodType<Prisma.PromptsAggregateArgs> = z.object({
  where: PromptsWhereInputSchema.optional(), 
  orderBy: z.union([ PromptsOrderByWithRelationInputSchema.array(), PromptsOrderByWithRelationInputSchema ]).optional(),
  cursor: PromptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PromptsGroupByArgsSchema: z.ZodType<Prisma.PromptsGroupByArgs> = z.object({
  where: PromptsWhereInputSchema.optional(), 
  orderBy: z.union([ PromptsOrderByWithAggregationInputSchema.array(), PromptsOrderByWithAggregationInputSchema ]).optional(),
  by: PromptsScalarFieldEnumSchema.array(), 
  having: PromptsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const PromptsFindUniqueArgsSchema: z.ZodType<Prisma.PromptsFindUniqueArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereUniqueInputSchema, 
}).strict();

export const PromptsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PromptsFindUniqueOrThrowArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereUniqueInputSchema, 
}).strict();

export const TagsFindFirstArgsSchema: z.ZodType<Prisma.TagsFindFirstArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereInputSchema.optional(), 
  orderBy: z.union([ TagsOrderByWithRelationInputSchema.array(), TagsOrderByWithRelationInputSchema ]).optional(),
  cursor: TagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagsScalarFieldEnumSchema, TagsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TagsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TagsFindFirstOrThrowArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereInputSchema.optional(), 
  orderBy: z.union([ TagsOrderByWithRelationInputSchema.array(), TagsOrderByWithRelationInputSchema ]).optional(),
  cursor: TagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagsScalarFieldEnumSchema, TagsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TagsFindManyArgsSchema: z.ZodType<Prisma.TagsFindManyArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereInputSchema.optional(), 
  orderBy: z.union([ TagsOrderByWithRelationInputSchema.array(), TagsOrderByWithRelationInputSchema ]).optional(),
  cursor: TagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TagsScalarFieldEnumSchema, TagsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const TagsAggregateArgsSchema: z.ZodType<Prisma.TagsAggregateArgs> = z.object({
  where: TagsWhereInputSchema.optional(), 
  orderBy: z.union([ TagsOrderByWithRelationInputSchema.array(), TagsOrderByWithRelationInputSchema ]).optional(),
  cursor: TagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const TagsGroupByArgsSchema: z.ZodType<Prisma.TagsGroupByArgs> = z.object({
  where: TagsWhereInputSchema.optional(), 
  orderBy: z.union([ TagsOrderByWithAggregationInputSchema.array(), TagsOrderByWithAggregationInputSchema ]).optional(),
  by: TagsScalarFieldEnumSchema.array(), 
  having: TagsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const TagsFindUniqueArgsSchema: z.ZodType<Prisma.TagsFindUniqueArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereUniqueInputSchema, 
}).strict();

export const TagsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.TagsFindUniqueOrThrowArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereUniqueInputSchema, 
}).strict();

export const Prompt_versionsFindFirstArgsSchema: z.ZodType<Prisma.Prompt_versionsFindFirstArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_versionsOrderByWithRelationInputSchema.array(), Prompt_versionsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_versionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_versionsScalarFieldEnumSchema, Prompt_versionsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_versionsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Prompt_versionsFindFirstOrThrowArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_versionsOrderByWithRelationInputSchema.array(), Prompt_versionsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_versionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_versionsScalarFieldEnumSchema, Prompt_versionsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_versionsFindManyArgsSchema: z.ZodType<Prisma.Prompt_versionsFindManyArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_versionsOrderByWithRelationInputSchema.array(), Prompt_versionsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_versionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_versionsScalarFieldEnumSchema, Prompt_versionsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_versionsAggregateArgsSchema: z.ZodType<Prisma.Prompt_versionsAggregateArgs> = z.object({
  where: Prompt_versionsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_versionsOrderByWithRelationInputSchema.array(), Prompt_versionsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_versionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_versionsGroupByArgsSchema: z.ZodType<Prisma.Prompt_versionsGroupByArgs> = z.object({
  where: Prompt_versionsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_versionsOrderByWithAggregationInputSchema.array(), Prompt_versionsOrderByWithAggregationInputSchema ]).optional(),
  by: Prompt_versionsScalarFieldEnumSchema.array(), 
  having: Prompt_versionsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_versionsFindUniqueArgsSchema: z.ZodType<Prisma.Prompt_versionsFindUniqueArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereUniqueInputSchema, 
}).strict();

export const Prompt_versionsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Prompt_versionsFindUniqueOrThrowArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereUniqueInputSchema, 
}).strict();

export const Prompt_variablesFindFirstArgsSchema: z.ZodType<Prisma.Prompt_variablesFindFirstArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_variablesOrderByWithRelationInputSchema.array(), Prompt_variablesOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_variablesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_variablesScalarFieldEnumSchema, Prompt_variablesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_variablesFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Prompt_variablesFindFirstOrThrowArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_variablesOrderByWithRelationInputSchema.array(), Prompt_variablesOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_variablesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_variablesScalarFieldEnumSchema, Prompt_variablesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_variablesFindManyArgsSchema: z.ZodType<Prisma.Prompt_variablesFindManyArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_variablesOrderByWithRelationInputSchema.array(), Prompt_variablesOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_variablesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_variablesScalarFieldEnumSchema, Prompt_variablesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_variablesAggregateArgsSchema: z.ZodType<Prisma.Prompt_variablesAggregateArgs> = z.object({
  where: Prompt_variablesWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_variablesOrderByWithRelationInputSchema.array(), Prompt_variablesOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_variablesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_variablesGroupByArgsSchema: z.ZodType<Prisma.Prompt_variablesGroupByArgs> = z.object({
  where: Prompt_variablesWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_variablesOrderByWithAggregationInputSchema.array(), Prompt_variablesOrderByWithAggregationInputSchema ]).optional(),
  by: Prompt_variablesScalarFieldEnumSchema.array(), 
  having: Prompt_variablesScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_variablesFindUniqueArgsSchema: z.ZodType<Prisma.Prompt_variablesFindUniqueArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereUniqueInputSchema, 
}).strict();

export const Prompt_variablesFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Prompt_variablesFindUniqueOrThrowArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereUniqueInputSchema, 
}).strict();

export const Prompt_tagsFindFirstArgsSchema: z.ZodType<Prisma.Prompt_tagsFindFirstArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_tagsOrderByWithRelationInputSchema.array(), Prompt_tagsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_tagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_tagsScalarFieldEnumSchema, Prompt_tagsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_tagsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Prompt_tagsFindFirstOrThrowArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_tagsOrderByWithRelationInputSchema.array(), Prompt_tagsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_tagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_tagsScalarFieldEnumSchema, Prompt_tagsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_tagsFindManyArgsSchema: z.ZodType<Prisma.Prompt_tagsFindManyArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_tagsOrderByWithRelationInputSchema.array(), Prompt_tagsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_tagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_tagsScalarFieldEnumSchema, Prompt_tagsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_tagsAggregateArgsSchema: z.ZodType<Prisma.Prompt_tagsAggregateArgs> = z.object({
  where: Prompt_tagsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_tagsOrderByWithRelationInputSchema.array(), Prompt_tagsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_tagsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_tagsGroupByArgsSchema: z.ZodType<Prisma.Prompt_tagsGroupByArgs> = z.object({
  where: Prompt_tagsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_tagsOrderByWithAggregationInputSchema.array(), Prompt_tagsOrderByWithAggregationInputSchema ]).optional(),
  by: Prompt_tagsScalarFieldEnumSchema.array(), 
  having: Prompt_tagsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_tagsFindUniqueArgsSchema: z.ZodType<Prisma.Prompt_tagsFindUniqueArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereUniqueInputSchema, 
}).strict();

export const Prompt_tagsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Prompt_tagsFindUniqueOrThrowArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereUniqueInputSchema, 
}).strict();

export const CollectionsFindFirstArgsSchema: z.ZodType<Prisma.CollectionsFindFirstArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereInputSchema.optional(), 
  orderBy: z.union([ CollectionsOrderByWithRelationInputSchema.array(), CollectionsOrderByWithRelationInputSchema ]).optional(),
  cursor: CollectionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CollectionsScalarFieldEnumSchema, CollectionsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CollectionsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.CollectionsFindFirstOrThrowArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereInputSchema.optional(), 
  orderBy: z.union([ CollectionsOrderByWithRelationInputSchema.array(), CollectionsOrderByWithRelationInputSchema ]).optional(),
  cursor: CollectionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CollectionsScalarFieldEnumSchema, CollectionsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CollectionsFindManyArgsSchema: z.ZodType<Prisma.CollectionsFindManyArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereInputSchema.optional(), 
  orderBy: z.union([ CollectionsOrderByWithRelationInputSchema.array(), CollectionsOrderByWithRelationInputSchema ]).optional(),
  cursor: CollectionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ CollectionsScalarFieldEnumSchema, CollectionsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const CollectionsAggregateArgsSchema: z.ZodType<Prisma.CollectionsAggregateArgs> = z.object({
  where: CollectionsWhereInputSchema.optional(), 
  orderBy: z.union([ CollectionsOrderByWithRelationInputSchema.array(), CollectionsOrderByWithRelationInputSchema ]).optional(),
  cursor: CollectionsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CollectionsGroupByArgsSchema: z.ZodType<Prisma.CollectionsGroupByArgs> = z.object({
  where: CollectionsWhereInputSchema.optional(), 
  orderBy: z.union([ CollectionsOrderByWithAggregationInputSchema.array(), CollectionsOrderByWithAggregationInputSchema ]).optional(),
  by: CollectionsScalarFieldEnumSchema.array(), 
  having: CollectionsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const CollectionsFindUniqueArgsSchema: z.ZodType<Prisma.CollectionsFindUniqueArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereUniqueInputSchema, 
}).strict();

export const CollectionsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.CollectionsFindUniqueOrThrowArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereUniqueInputSchema, 
}).strict();

export const Collections_promptsFindFirstArgsSchema: z.ZodType<Prisma.Collections_promptsFindFirstArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereInputSchema.optional(), 
  orderBy: z.union([ Collections_promptsOrderByWithRelationInputSchema.array(), Collections_promptsOrderByWithRelationInputSchema ]).optional(),
  cursor: Collections_promptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Collections_promptsScalarFieldEnumSchema, Collections_promptsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Collections_promptsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Collections_promptsFindFirstOrThrowArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereInputSchema.optional(), 
  orderBy: z.union([ Collections_promptsOrderByWithRelationInputSchema.array(), Collections_promptsOrderByWithRelationInputSchema ]).optional(),
  cursor: Collections_promptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Collections_promptsScalarFieldEnumSchema, Collections_promptsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Collections_promptsFindManyArgsSchema: z.ZodType<Prisma.Collections_promptsFindManyArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereInputSchema.optional(), 
  orderBy: z.union([ Collections_promptsOrderByWithRelationInputSchema.array(), Collections_promptsOrderByWithRelationInputSchema ]).optional(),
  cursor: Collections_promptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Collections_promptsScalarFieldEnumSchema, Collections_promptsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Collections_promptsAggregateArgsSchema: z.ZodType<Prisma.Collections_promptsAggregateArgs> = z.object({
  where: Collections_promptsWhereInputSchema.optional(), 
  orderBy: z.union([ Collections_promptsOrderByWithRelationInputSchema.array(), Collections_promptsOrderByWithRelationInputSchema ]).optional(),
  cursor: Collections_promptsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Collections_promptsGroupByArgsSchema: z.ZodType<Prisma.Collections_promptsGroupByArgs> = z.object({
  where: Collections_promptsWhereInputSchema.optional(), 
  orderBy: z.union([ Collections_promptsOrderByWithAggregationInputSchema.array(), Collections_promptsOrderByWithAggregationInputSchema ]).optional(),
  by: Collections_promptsScalarFieldEnumSchema.array(), 
  having: Collections_promptsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Collections_promptsFindUniqueArgsSchema: z.ZodType<Prisma.Collections_promptsFindUniqueArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereUniqueInputSchema, 
}).strict();

export const Collections_promptsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Collections_promptsFindUniqueOrThrowArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereUniqueInputSchema, 
}).strict();

export const FavoritesFindFirstArgsSchema: z.ZodType<Prisma.FavoritesFindFirstArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereInputSchema.optional(), 
  orderBy: z.union([ FavoritesOrderByWithRelationInputSchema.array(), FavoritesOrderByWithRelationInputSchema ]).optional(),
  cursor: FavoritesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FavoritesScalarFieldEnumSchema, FavoritesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const FavoritesFindFirstOrThrowArgsSchema: z.ZodType<Prisma.FavoritesFindFirstOrThrowArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereInputSchema.optional(), 
  orderBy: z.union([ FavoritesOrderByWithRelationInputSchema.array(), FavoritesOrderByWithRelationInputSchema ]).optional(),
  cursor: FavoritesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FavoritesScalarFieldEnumSchema, FavoritesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const FavoritesFindManyArgsSchema: z.ZodType<Prisma.FavoritesFindManyArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereInputSchema.optional(), 
  orderBy: z.union([ FavoritesOrderByWithRelationInputSchema.array(), FavoritesOrderByWithRelationInputSchema ]).optional(),
  cursor: FavoritesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ FavoritesScalarFieldEnumSchema, FavoritesScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const FavoritesAggregateArgsSchema: z.ZodType<Prisma.FavoritesAggregateArgs> = z.object({
  where: FavoritesWhereInputSchema.optional(), 
  orderBy: z.union([ FavoritesOrderByWithRelationInputSchema.array(), FavoritesOrderByWithRelationInputSchema ]).optional(),
  cursor: FavoritesWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const FavoritesGroupByArgsSchema: z.ZodType<Prisma.FavoritesGroupByArgs> = z.object({
  where: FavoritesWhereInputSchema.optional(), 
  orderBy: z.union([ FavoritesOrderByWithAggregationInputSchema.array(), FavoritesOrderByWithAggregationInputSchema ]).optional(),
  by: FavoritesScalarFieldEnumSchema.array(), 
  having: FavoritesScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const FavoritesFindUniqueArgsSchema: z.ZodType<Prisma.FavoritesFindUniqueArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereUniqueInputSchema, 
}).strict();

export const FavoritesFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.FavoritesFindUniqueOrThrowArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereUniqueInputSchema, 
}).strict();

export const Prompt_runFindFirstArgsSchema: z.ZodType<Prisma.Prompt_runFindFirstArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_runOrderByWithRelationInputSchema.array(), Prompt_runOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_runWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_runScalarFieldEnumSchema, Prompt_runScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_runFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Prompt_runFindFirstOrThrowArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_runOrderByWithRelationInputSchema.array(), Prompt_runOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_runWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_runScalarFieldEnumSchema, Prompt_runScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_runFindManyArgsSchema: z.ZodType<Prisma.Prompt_runFindManyArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_runOrderByWithRelationInputSchema.array(), Prompt_runOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_runWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_runScalarFieldEnumSchema, Prompt_runScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_runAggregateArgsSchema: z.ZodType<Prisma.Prompt_runAggregateArgs> = z.object({
  where: Prompt_runWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_runOrderByWithRelationInputSchema.array(), Prompt_runOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_runWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_runGroupByArgsSchema: z.ZodType<Prisma.Prompt_runGroupByArgs> = z.object({
  where: Prompt_runWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_runOrderByWithAggregationInputSchema.array(), Prompt_runOrderByWithAggregationInputSchema ]).optional(),
  by: Prompt_runScalarFieldEnumSchema.array(), 
  having: Prompt_runScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_runFindUniqueArgsSchema: z.ZodType<Prisma.Prompt_runFindUniqueArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereUniqueInputSchema, 
}).strict();

export const Prompt_runFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Prompt_runFindUniqueOrThrowArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereUniqueInputSchema, 
}).strict();

export const Activity_logFindFirstArgsSchema: z.ZodType<Prisma.Activity_logFindFirstArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereInputSchema.optional(), 
  orderBy: z.union([ Activity_logOrderByWithRelationInputSchema.array(), Activity_logOrderByWithRelationInputSchema ]).optional(),
  cursor: Activity_logWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Activity_logScalarFieldEnumSchema, Activity_logScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Activity_logFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Activity_logFindFirstOrThrowArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereInputSchema.optional(), 
  orderBy: z.union([ Activity_logOrderByWithRelationInputSchema.array(), Activity_logOrderByWithRelationInputSchema ]).optional(),
  cursor: Activity_logWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Activity_logScalarFieldEnumSchema, Activity_logScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Activity_logFindManyArgsSchema: z.ZodType<Prisma.Activity_logFindManyArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereInputSchema.optional(), 
  orderBy: z.union([ Activity_logOrderByWithRelationInputSchema.array(), Activity_logOrderByWithRelationInputSchema ]).optional(),
  cursor: Activity_logWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Activity_logScalarFieldEnumSchema, Activity_logScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Activity_logAggregateArgsSchema: z.ZodType<Prisma.Activity_logAggregateArgs> = z.object({
  where: Activity_logWhereInputSchema.optional(), 
  orderBy: z.union([ Activity_logOrderByWithRelationInputSchema.array(), Activity_logOrderByWithRelationInputSchema ]).optional(),
  cursor: Activity_logWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Activity_logGroupByArgsSchema: z.ZodType<Prisma.Activity_logGroupByArgs> = z.object({
  where: Activity_logWhereInputSchema.optional(), 
  orderBy: z.union([ Activity_logOrderByWithAggregationInputSchema.array(), Activity_logOrderByWithAggregationInputSchema ]).optional(),
  by: Activity_logScalarFieldEnumSchema.array(), 
  having: Activity_logScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Activity_logFindUniqueArgsSchema: z.ZodType<Prisma.Activity_logFindUniqueArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereUniqueInputSchema, 
}).strict();

export const Activity_logFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Activity_logFindUniqueOrThrowArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereUniqueInputSchema, 
}).strict();

export const Prompt_commentsFindFirstArgsSchema: z.ZodType<Prisma.Prompt_commentsFindFirstArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_commentsOrderByWithRelationInputSchema.array(), Prompt_commentsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_commentsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_commentsScalarFieldEnumSchema, Prompt_commentsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_commentsFindFirstOrThrowArgsSchema: z.ZodType<Prisma.Prompt_commentsFindFirstOrThrowArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_commentsOrderByWithRelationInputSchema.array(), Prompt_commentsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_commentsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_commentsScalarFieldEnumSchema, Prompt_commentsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_commentsFindManyArgsSchema: z.ZodType<Prisma.Prompt_commentsFindManyArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_commentsOrderByWithRelationInputSchema.array(), Prompt_commentsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_commentsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ Prompt_commentsScalarFieldEnumSchema, Prompt_commentsScalarFieldEnumSchema.array() ]).optional(),
}).strict();

export const Prompt_commentsAggregateArgsSchema: z.ZodType<Prisma.Prompt_commentsAggregateArgs> = z.object({
  where: Prompt_commentsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_commentsOrderByWithRelationInputSchema.array(), Prompt_commentsOrderByWithRelationInputSchema ]).optional(),
  cursor: Prompt_commentsWhereUniqueInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_commentsGroupByArgsSchema: z.ZodType<Prisma.Prompt_commentsGroupByArgs> = z.object({
  where: Prompt_commentsWhereInputSchema.optional(), 
  orderBy: z.union([ Prompt_commentsOrderByWithAggregationInputSchema.array(), Prompt_commentsOrderByWithAggregationInputSchema ]).optional(),
  by: Prompt_commentsScalarFieldEnumSchema.array(), 
  having: Prompt_commentsScalarWhereWithAggregatesInputSchema.optional(), 
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict();

export const Prompt_commentsFindUniqueArgsSchema: z.ZodType<Prisma.Prompt_commentsFindUniqueArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereUniqueInputSchema, 
}).strict();

export const Prompt_commentsFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.Prompt_commentsFindUniqueOrThrowArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereUniqueInputSchema, 
}).strict();

export const UsersCreateArgsSchema: z.ZodType<Prisma.UsersCreateArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  data: z.union([ UsersCreateInputSchema, UsersUncheckedCreateInputSchema ]),
}).strict();

export const UsersUpsertArgsSchema: z.ZodType<Prisma.UsersUpsertArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema, 
  create: z.union([ UsersCreateInputSchema, UsersUncheckedCreateInputSchema ]),
  update: z.union([ UsersUpdateInputSchema, UsersUncheckedUpdateInputSchema ]),
}).strict();

export const UsersCreateManyArgsSchema: z.ZodType<Prisma.UsersCreateManyArgs> = z.object({
  data: z.union([ UsersCreateManyInputSchema, UsersCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UsersCreateManyAndReturnArgsSchema: z.ZodType<Prisma.UsersCreateManyAndReturnArgs> = z.object({
  data: z.union([ UsersCreateManyInputSchema, UsersCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const UsersDeleteArgsSchema: z.ZodType<Prisma.UsersDeleteArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  where: UsersWhereUniqueInputSchema, 
}).strict();

export const UsersUpdateArgsSchema: z.ZodType<Prisma.UsersUpdateArgs> = z.object({
  select: UsersSelectSchema.optional(),
  include: UsersIncludeSchema.optional(),
  data: z.union([ UsersUpdateInputSchema, UsersUncheckedUpdateInputSchema ]),
  where: UsersWhereUniqueInputSchema, 
}).strict();

export const UsersUpdateManyArgsSchema: z.ZodType<Prisma.UsersUpdateManyArgs> = z.object({
  data: z.union([ UsersUpdateManyMutationInputSchema, UsersUncheckedUpdateManyInputSchema ]),
  where: UsersWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UsersUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.UsersUpdateManyAndReturnArgs> = z.object({
  data: z.union([ UsersUpdateManyMutationInputSchema, UsersUncheckedUpdateManyInputSchema ]),
  where: UsersWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const UsersDeleteManyArgsSchema: z.ZodType<Prisma.UsersDeleteManyArgs> = z.object({
  where: UsersWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CategoriesCreateArgsSchema: z.ZodType<Prisma.CategoriesCreateArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  data: z.union([ CategoriesCreateInputSchema, CategoriesUncheckedCreateInputSchema ]),
}).strict();

export const CategoriesUpsertArgsSchema: z.ZodType<Prisma.CategoriesUpsertArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereUniqueInputSchema, 
  create: z.union([ CategoriesCreateInputSchema, CategoriesUncheckedCreateInputSchema ]),
  update: z.union([ CategoriesUpdateInputSchema, CategoriesUncheckedUpdateInputSchema ]),
}).strict();

export const CategoriesCreateManyArgsSchema: z.ZodType<Prisma.CategoriesCreateManyArgs> = z.object({
  data: z.union([ CategoriesCreateManyInputSchema, CategoriesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CategoriesCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoriesCreateManyAndReturnArgs> = z.object({
  data: z.union([ CategoriesCreateManyInputSchema, CategoriesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CategoriesDeleteArgsSchema: z.ZodType<Prisma.CategoriesDeleteArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  where: CategoriesWhereUniqueInputSchema, 
}).strict();

export const CategoriesUpdateArgsSchema: z.ZodType<Prisma.CategoriesUpdateArgs> = z.object({
  select: CategoriesSelectSchema.optional(),
  include: CategoriesIncludeSchema.optional(),
  data: z.union([ CategoriesUpdateInputSchema, CategoriesUncheckedUpdateInputSchema ]),
  where: CategoriesWhereUniqueInputSchema, 
}).strict();

export const CategoriesUpdateManyArgsSchema: z.ZodType<Prisma.CategoriesUpdateManyArgs> = z.object({
  data: z.union([ CategoriesUpdateManyMutationInputSchema, CategoriesUncheckedUpdateManyInputSchema ]),
  where: CategoriesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CategoriesUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CategoriesUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CategoriesUpdateManyMutationInputSchema, CategoriesUncheckedUpdateManyInputSchema ]),
  where: CategoriesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CategoriesDeleteManyArgsSchema: z.ZodType<Prisma.CategoriesDeleteManyArgs> = z.object({
  where: CategoriesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PromptsCreateArgsSchema: z.ZodType<Prisma.PromptsCreateArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  data: z.union([ PromptsCreateInputSchema, PromptsUncheckedCreateInputSchema ]),
}).strict();

export const PromptsUpsertArgsSchema: z.ZodType<Prisma.PromptsUpsertArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereUniqueInputSchema, 
  create: z.union([ PromptsCreateInputSchema, PromptsUncheckedCreateInputSchema ]),
  update: z.union([ PromptsUpdateInputSchema, PromptsUncheckedUpdateInputSchema ]),
}).strict();

export const PromptsCreateManyArgsSchema: z.ZodType<Prisma.PromptsCreateManyArgs> = z.object({
  data: z.union([ PromptsCreateManyInputSchema, PromptsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PromptsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PromptsCreateManyAndReturnArgs> = z.object({
  data: z.union([ PromptsCreateManyInputSchema, PromptsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const PromptsDeleteArgsSchema: z.ZodType<Prisma.PromptsDeleteArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  where: PromptsWhereUniqueInputSchema, 
}).strict();

export const PromptsUpdateArgsSchema: z.ZodType<Prisma.PromptsUpdateArgs> = z.object({
  select: PromptsSelectSchema.optional(),
  include: PromptsIncludeSchema.optional(),
  data: z.union([ PromptsUpdateInputSchema, PromptsUncheckedUpdateInputSchema ]),
  where: PromptsWhereUniqueInputSchema, 
}).strict();

export const PromptsUpdateManyArgsSchema: z.ZodType<Prisma.PromptsUpdateManyArgs> = z.object({
  data: z.union([ PromptsUpdateManyMutationInputSchema, PromptsUncheckedUpdateManyInputSchema ]),
  where: PromptsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PromptsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PromptsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PromptsUpdateManyMutationInputSchema, PromptsUncheckedUpdateManyInputSchema ]),
  where: PromptsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const PromptsDeleteManyArgsSchema: z.ZodType<Prisma.PromptsDeleteManyArgs> = z.object({
  where: PromptsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TagsCreateArgsSchema: z.ZodType<Prisma.TagsCreateArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  data: z.union([ TagsCreateInputSchema, TagsUncheckedCreateInputSchema ]),
}).strict();

export const TagsUpsertArgsSchema: z.ZodType<Prisma.TagsUpsertArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereUniqueInputSchema, 
  create: z.union([ TagsCreateInputSchema, TagsUncheckedCreateInputSchema ]),
  update: z.union([ TagsUpdateInputSchema, TagsUncheckedUpdateInputSchema ]),
}).strict();

export const TagsCreateManyArgsSchema: z.ZodType<Prisma.TagsCreateManyArgs> = z.object({
  data: z.union([ TagsCreateManyInputSchema, TagsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const TagsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TagsCreateManyAndReturnArgs> = z.object({
  data: z.union([ TagsCreateManyInputSchema, TagsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const TagsDeleteArgsSchema: z.ZodType<Prisma.TagsDeleteArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  where: TagsWhereUniqueInputSchema, 
}).strict();

export const TagsUpdateArgsSchema: z.ZodType<Prisma.TagsUpdateArgs> = z.object({
  select: TagsSelectSchema.optional(),
  include: TagsIncludeSchema.optional(),
  data: z.union([ TagsUpdateInputSchema, TagsUncheckedUpdateInputSchema ]),
  where: TagsWhereUniqueInputSchema, 
}).strict();

export const TagsUpdateManyArgsSchema: z.ZodType<Prisma.TagsUpdateManyArgs> = z.object({
  data: z.union([ TagsUpdateManyMutationInputSchema, TagsUncheckedUpdateManyInputSchema ]),
  where: TagsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TagsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TagsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TagsUpdateManyMutationInputSchema, TagsUncheckedUpdateManyInputSchema ]),
  where: TagsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const TagsDeleteManyArgsSchema: z.ZodType<Prisma.TagsDeleteManyArgs> = z.object({
  where: TagsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_versionsCreateArgsSchema: z.ZodType<Prisma.Prompt_versionsCreateArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  data: z.union([ Prompt_versionsCreateInputSchema, Prompt_versionsUncheckedCreateInputSchema ]),
}).strict();

export const Prompt_versionsUpsertArgsSchema: z.ZodType<Prisma.Prompt_versionsUpsertArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereUniqueInputSchema, 
  create: z.union([ Prompt_versionsCreateInputSchema, Prompt_versionsUncheckedCreateInputSchema ]),
  update: z.union([ Prompt_versionsUpdateInputSchema, Prompt_versionsUncheckedUpdateInputSchema ]),
}).strict();

export const Prompt_versionsCreateManyArgsSchema: z.ZodType<Prisma.Prompt_versionsCreateManyArgs> = z.object({
  data: z.union([ Prompt_versionsCreateManyInputSchema, Prompt_versionsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_versionsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_versionsCreateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_versionsCreateManyInputSchema, Prompt_versionsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_versionsDeleteArgsSchema: z.ZodType<Prisma.Prompt_versionsDeleteArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  where: Prompt_versionsWhereUniqueInputSchema, 
}).strict();

export const Prompt_versionsUpdateArgsSchema: z.ZodType<Prisma.Prompt_versionsUpdateArgs> = z.object({
  select: Prompt_versionsSelectSchema.optional(),
  include: Prompt_versionsIncludeSchema.optional(),
  data: z.union([ Prompt_versionsUpdateInputSchema, Prompt_versionsUncheckedUpdateInputSchema ]),
  where: Prompt_versionsWhereUniqueInputSchema, 
}).strict();

export const Prompt_versionsUpdateManyArgsSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyArgs> = z.object({
  data: z.union([ Prompt_versionsUpdateManyMutationInputSchema, Prompt_versionsUncheckedUpdateManyInputSchema ]),
  where: Prompt_versionsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_versionsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_versionsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_versionsUpdateManyMutationInputSchema, Prompt_versionsUncheckedUpdateManyInputSchema ]),
  where: Prompt_versionsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_versionsDeleteManyArgsSchema: z.ZodType<Prisma.Prompt_versionsDeleteManyArgs> = z.object({
  where: Prompt_versionsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_variablesCreateArgsSchema: z.ZodType<Prisma.Prompt_variablesCreateArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  data: z.union([ Prompt_variablesCreateInputSchema, Prompt_variablesUncheckedCreateInputSchema ]),
}).strict();

export const Prompt_variablesUpsertArgsSchema: z.ZodType<Prisma.Prompt_variablesUpsertArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereUniqueInputSchema, 
  create: z.union([ Prompt_variablesCreateInputSchema, Prompt_variablesUncheckedCreateInputSchema ]),
  update: z.union([ Prompt_variablesUpdateInputSchema, Prompt_variablesUncheckedUpdateInputSchema ]),
}).strict();

export const Prompt_variablesCreateManyArgsSchema: z.ZodType<Prisma.Prompt_variablesCreateManyArgs> = z.object({
  data: z.union([ Prompt_variablesCreateManyInputSchema, Prompt_variablesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_variablesCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_variablesCreateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_variablesCreateManyInputSchema, Prompt_variablesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_variablesDeleteArgsSchema: z.ZodType<Prisma.Prompt_variablesDeleteArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  where: Prompt_variablesWhereUniqueInputSchema, 
}).strict();

export const Prompt_variablesUpdateArgsSchema: z.ZodType<Prisma.Prompt_variablesUpdateArgs> = z.object({
  select: Prompt_variablesSelectSchema.optional(),
  include: Prompt_variablesIncludeSchema.optional(),
  data: z.union([ Prompt_variablesUpdateInputSchema, Prompt_variablesUncheckedUpdateInputSchema ]),
  where: Prompt_variablesWhereUniqueInputSchema, 
}).strict();

export const Prompt_variablesUpdateManyArgsSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyArgs> = z.object({
  data: z.union([ Prompt_variablesUpdateManyMutationInputSchema, Prompt_variablesUncheckedUpdateManyInputSchema ]),
  where: Prompt_variablesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_variablesUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_variablesUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_variablesUpdateManyMutationInputSchema, Prompt_variablesUncheckedUpdateManyInputSchema ]),
  where: Prompt_variablesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_variablesDeleteManyArgsSchema: z.ZodType<Prisma.Prompt_variablesDeleteManyArgs> = z.object({
  where: Prompt_variablesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_tagsCreateArgsSchema: z.ZodType<Prisma.Prompt_tagsCreateArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  data: z.union([ Prompt_tagsCreateInputSchema, Prompt_tagsUncheckedCreateInputSchema ]),
}).strict();

export const Prompt_tagsUpsertArgsSchema: z.ZodType<Prisma.Prompt_tagsUpsertArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereUniqueInputSchema, 
  create: z.union([ Prompt_tagsCreateInputSchema, Prompt_tagsUncheckedCreateInputSchema ]),
  update: z.union([ Prompt_tagsUpdateInputSchema, Prompt_tagsUncheckedUpdateInputSchema ]),
}).strict();

export const Prompt_tagsCreateManyArgsSchema: z.ZodType<Prisma.Prompt_tagsCreateManyArgs> = z.object({
  data: z.union([ Prompt_tagsCreateManyInputSchema, Prompt_tagsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_tagsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_tagsCreateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_tagsCreateManyInputSchema, Prompt_tagsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_tagsDeleteArgsSchema: z.ZodType<Prisma.Prompt_tagsDeleteArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  where: Prompt_tagsWhereUniqueInputSchema, 
}).strict();

export const Prompt_tagsUpdateArgsSchema: z.ZodType<Prisma.Prompt_tagsUpdateArgs> = z.object({
  select: Prompt_tagsSelectSchema.optional(),
  include: Prompt_tagsIncludeSchema.optional(),
  data: z.union([ Prompt_tagsUpdateInputSchema, Prompt_tagsUncheckedUpdateInputSchema ]),
  where: Prompt_tagsWhereUniqueInputSchema, 
}).strict();

export const Prompt_tagsUpdateManyArgsSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyArgs> = z.object({
  data: z.union([ Prompt_tagsUpdateManyMutationInputSchema, Prompt_tagsUncheckedUpdateManyInputSchema ]),
  where: Prompt_tagsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_tagsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_tagsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_tagsUpdateManyMutationInputSchema, Prompt_tagsUncheckedUpdateManyInputSchema ]),
  where: Prompt_tagsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_tagsDeleteManyArgsSchema: z.ZodType<Prisma.Prompt_tagsDeleteManyArgs> = z.object({
  where: Prompt_tagsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CollectionsCreateArgsSchema: z.ZodType<Prisma.CollectionsCreateArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  data: z.union([ CollectionsCreateInputSchema, CollectionsUncheckedCreateInputSchema ]),
}).strict();

export const CollectionsUpsertArgsSchema: z.ZodType<Prisma.CollectionsUpsertArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereUniqueInputSchema, 
  create: z.union([ CollectionsCreateInputSchema, CollectionsUncheckedCreateInputSchema ]),
  update: z.union([ CollectionsUpdateInputSchema, CollectionsUncheckedUpdateInputSchema ]),
}).strict();

export const CollectionsCreateManyArgsSchema: z.ZodType<Prisma.CollectionsCreateManyArgs> = z.object({
  data: z.union([ CollectionsCreateManyInputSchema, CollectionsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CollectionsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CollectionsCreateManyAndReturnArgs> = z.object({
  data: z.union([ CollectionsCreateManyInputSchema, CollectionsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const CollectionsDeleteArgsSchema: z.ZodType<Prisma.CollectionsDeleteArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  where: CollectionsWhereUniqueInputSchema, 
}).strict();

export const CollectionsUpdateArgsSchema: z.ZodType<Prisma.CollectionsUpdateArgs> = z.object({
  select: CollectionsSelectSchema.optional(),
  include: CollectionsIncludeSchema.optional(),
  data: z.union([ CollectionsUpdateInputSchema, CollectionsUncheckedUpdateInputSchema ]),
  where: CollectionsWhereUniqueInputSchema, 
}).strict();

export const CollectionsUpdateManyArgsSchema: z.ZodType<Prisma.CollectionsUpdateManyArgs> = z.object({
  data: z.union([ CollectionsUpdateManyMutationInputSchema, CollectionsUncheckedUpdateManyInputSchema ]),
  where: CollectionsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CollectionsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CollectionsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ CollectionsUpdateManyMutationInputSchema, CollectionsUncheckedUpdateManyInputSchema ]),
  where: CollectionsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const CollectionsDeleteManyArgsSchema: z.ZodType<Prisma.CollectionsDeleteManyArgs> = z.object({
  where: CollectionsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Collections_promptsCreateArgsSchema: z.ZodType<Prisma.Collections_promptsCreateArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  data: z.union([ Collections_promptsCreateInputSchema, Collections_promptsUncheckedCreateInputSchema ]),
}).strict();

export const Collections_promptsUpsertArgsSchema: z.ZodType<Prisma.Collections_promptsUpsertArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereUniqueInputSchema, 
  create: z.union([ Collections_promptsCreateInputSchema, Collections_promptsUncheckedCreateInputSchema ]),
  update: z.union([ Collections_promptsUpdateInputSchema, Collections_promptsUncheckedUpdateInputSchema ]),
}).strict();

export const Collections_promptsCreateManyArgsSchema: z.ZodType<Prisma.Collections_promptsCreateManyArgs> = z.object({
  data: z.union([ Collections_promptsCreateManyInputSchema, Collections_promptsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Collections_promptsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Collections_promptsCreateManyAndReturnArgs> = z.object({
  data: z.union([ Collections_promptsCreateManyInputSchema, Collections_promptsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Collections_promptsDeleteArgsSchema: z.ZodType<Prisma.Collections_promptsDeleteArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  where: Collections_promptsWhereUniqueInputSchema, 
}).strict();

export const Collections_promptsUpdateArgsSchema: z.ZodType<Prisma.Collections_promptsUpdateArgs> = z.object({
  select: Collections_promptsSelectSchema.optional(),
  include: Collections_promptsIncludeSchema.optional(),
  data: z.union([ Collections_promptsUpdateInputSchema, Collections_promptsUncheckedUpdateInputSchema ]),
  where: Collections_promptsWhereUniqueInputSchema, 
}).strict();

export const Collections_promptsUpdateManyArgsSchema: z.ZodType<Prisma.Collections_promptsUpdateManyArgs> = z.object({
  data: z.union([ Collections_promptsUpdateManyMutationInputSchema, Collections_promptsUncheckedUpdateManyInputSchema ]),
  where: Collections_promptsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Collections_promptsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Collections_promptsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Collections_promptsUpdateManyMutationInputSchema, Collections_promptsUncheckedUpdateManyInputSchema ]),
  where: Collections_promptsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Collections_promptsDeleteManyArgsSchema: z.ZodType<Prisma.Collections_promptsDeleteManyArgs> = z.object({
  where: Collections_promptsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const FavoritesCreateArgsSchema: z.ZodType<Prisma.FavoritesCreateArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  data: z.union([ FavoritesCreateInputSchema, FavoritesUncheckedCreateInputSchema ]),
}).strict();

export const FavoritesUpsertArgsSchema: z.ZodType<Prisma.FavoritesUpsertArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereUniqueInputSchema, 
  create: z.union([ FavoritesCreateInputSchema, FavoritesUncheckedCreateInputSchema ]),
  update: z.union([ FavoritesUpdateInputSchema, FavoritesUncheckedUpdateInputSchema ]),
}).strict();

export const FavoritesCreateManyArgsSchema: z.ZodType<Prisma.FavoritesCreateManyArgs> = z.object({
  data: z.union([ FavoritesCreateManyInputSchema, FavoritesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const FavoritesCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FavoritesCreateManyAndReturnArgs> = z.object({
  data: z.union([ FavoritesCreateManyInputSchema, FavoritesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const FavoritesDeleteArgsSchema: z.ZodType<Prisma.FavoritesDeleteArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  where: FavoritesWhereUniqueInputSchema, 
}).strict();

export const FavoritesUpdateArgsSchema: z.ZodType<Prisma.FavoritesUpdateArgs> = z.object({
  select: FavoritesSelectSchema.optional(),
  include: FavoritesIncludeSchema.optional(),
  data: z.union([ FavoritesUpdateInputSchema, FavoritesUncheckedUpdateInputSchema ]),
  where: FavoritesWhereUniqueInputSchema, 
}).strict();

export const FavoritesUpdateManyArgsSchema: z.ZodType<Prisma.FavoritesUpdateManyArgs> = z.object({
  data: z.union([ FavoritesUpdateManyMutationInputSchema, FavoritesUncheckedUpdateManyInputSchema ]),
  where: FavoritesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const FavoritesUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FavoritesUpdateManyAndReturnArgs> = z.object({
  data: z.union([ FavoritesUpdateManyMutationInputSchema, FavoritesUncheckedUpdateManyInputSchema ]),
  where: FavoritesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const FavoritesDeleteManyArgsSchema: z.ZodType<Prisma.FavoritesDeleteManyArgs> = z.object({
  where: FavoritesWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_runCreateArgsSchema: z.ZodType<Prisma.Prompt_runCreateArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  data: z.union([ Prompt_runCreateInputSchema, Prompt_runUncheckedCreateInputSchema ]),
}).strict();

export const Prompt_runUpsertArgsSchema: z.ZodType<Prisma.Prompt_runUpsertArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereUniqueInputSchema, 
  create: z.union([ Prompt_runCreateInputSchema, Prompt_runUncheckedCreateInputSchema ]),
  update: z.union([ Prompt_runUpdateInputSchema, Prompt_runUncheckedUpdateInputSchema ]),
}).strict();

export const Prompt_runCreateManyArgsSchema: z.ZodType<Prisma.Prompt_runCreateManyArgs> = z.object({
  data: z.union([ Prompt_runCreateManyInputSchema, Prompt_runCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_runCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_runCreateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_runCreateManyInputSchema, Prompt_runCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_runDeleteArgsSchema: z.ZodType<Prisma.Prompt_runDeleteArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  where: Prompt_runWhereUniqueInputSchema, 
}).strict();

export const Prompt_runUpdateArgsSchema: z.ZodType<Prisma.Prompt_runUpdateArgs> = z.object({
  select: Prompt_runSelectSchema.optional(),
  include: Prompt_runIncludeSchema.optional(),
  data: z.union([ Prompt_runUpdateInputSchema, Prompt_runUncheckedUpdateInputSchema ]),
  where: Prompt_runWhereUniqueInputSchema, 
}).strict();

export const Prompt_runUpdateManyArgsSchema: z.ZodType<Prisma.Prompt_runUpdateManyArgs> = z.object({
  data: z.union([ Prompt_runUpdateManyMutationInputSchema, Prompt_runUncheckedUpdateManyInputSchema ]),
  where: Prompt_runWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_runUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_runUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_runUpdateManyMutationInputSchema, Prompt_runUncheckedUpdateManyInputSchema ]),
  where: Prompt_runWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_runDeleteManyArgsSchema: z.ZodType<Prisma.Prompt_runDeleteManyArgs> = z.object({
  where: Prompt_runWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Activity_logCreateArgsSchema: z.ZodType<Prisma.Activity_logCreateArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  data: z.union([ Activity_logCreateInputSchema, Activity_logUncheckedCreateInputSchema ]),
}).strict();

export const Activity_logUpsertArgsSchema: z.ZodType<Prisma.Activity_logUpsertArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereUniqueInputSchema, 
  create: z.union([ Activity_logCreateInputSchema, Activity_logUncheckedCreateInputSchema ]),
  update: z.union([ Activity_logUpdateInputSchema, Activity_logUncheckedUpdateInputSchema ]),
}).strict();

export const Activity_logCreateManyArgsSchema: z.ZodType<Prisma.Activity_logCreateManyArgs> = z.object({
  data: z.union([ Activity_logCreateManyInputSchema, Activity_logCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Activity_logCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Activity_logCreateManyAndReturnArgs> = z.object({
  data: z.union([ Activity_logCreateManyInputSchema, Activity_logCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Activity_logDeleteArgsSchema: z.ZodType<Prisma.Activity_logDeleteArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  where: Activity_logWhereUniqueInputSchema, 
}).strict();

export const Activity_logUpdateArgsSchema: z.ZodType<Prisma.Activity_logUpdateArgs> = z.object({
  select: Activity_logSelectSchema.optional(),
  include: Activity_logIncludeSchema.optional(),
  data: z.union([ Activity_logUpdateInputSchema, Activity_logUncheckedUpdateInputSchema ]),
  where: Activity_logWhereUniqueInputSchema, 
}).strict();

export const Activity_logUpdateManyArgsSchema: z.ZodType<Prisma.Activity_logUpdateManyArgs> = z.object({
  data: z.union([ Activity_logUpdateManyMutationInputSchema, Activity_logUncheckedUpdateManyInputSchema ]),
  where: Activity_logWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Activity_logUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Activity_logUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Activity_logUpdateManyMutationInputSchema, Activity_logUncheckedUpdateManyInputSchema ]),
  where: Activity_logWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Activity_logDeleteManyArgsSchema: z.ZodType<Prisma.Activity_logDeleteManyArgs> = z.object({
  where: Activity_logWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_commentsCreateArgsSchema: z.ZodType<Prisma.Prompt_commentsCreateArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  data: z.union([ Prompt_commentsCreateInputSchema, Prompt_commentsUncheckedCreateInputSchema ]),
}).strict();

export const Prompt_commentsUpsertArgsSchema: z.ZodType<Prisma.Prompt_commentsUpsertArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereUniqueInputSchema, 
  create: z.union([ Prompt_commentsCreateInputSchema, Prompt_commentsUncheckedCreateInputSchema ]),
  update: z.union([ Prompt_commentsUpdateInputSchema, Prompt_commentsUncheckedUpdateInputSchema ]),
}).strict();

export const Prompt_commentsCreateManyArgsSchema: z.ZodType<Prisma.Prompt_commentsCreateManyArgs> = z.object({
  data: z.union([ Prompt_commentsCreateManyInputSchema, Prompt_commentsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_commentsCreateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_commentsCreateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_commentsCreateManyInputSchema, Prompt_commentsCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict();

export const Prompt_commentsDeleteArgsSchema: z.ZodType<Prisma.Prompt_commentsDeleteArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  where: Prompt_commentsWhereUniqueInputSchema, 
}).strict();

export const Prompt_commentsUpdateArgsSchema: z.ZodType<Prisma.Prompt_commentsUpdateArgs> = z.object({
  select: Prompt_commentsSelectSchema.optional(),
  include: Prompt_commentsIncludeSchema.optional(),
  data: z.union([ Prompt_commentsUpdateInputSchema, Prompt_commentsUncheckedUpdateInputSchema ]),
  where: Prompt_commentsWhereUniqueInputSchema, 
}).strict();

export const Prompt_commentsUpdateManyArgsSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyArgs> = z.object({
  data: z.union([ Prompt_commentsUpdateManyMutationInputSchema, Prompt_commentsUncheckedUpdateManyInputSchema ]),
  where: Prompt_commentsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_commentsUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.Prompt_commentsUpdateManyAndReturnArgs> = z.object({
  data: z.union([ Prompt_commentsUpdateManyMutationInputSchema, Prompt_commentsUncheckedUpdateManyInputSchema ]),
  where: Prompt_commentsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();

export const Prompt_commentsDeleteManyArgsSchema: z.ZodType<Prisma.Prompt_commentsDeleteManyArgs> = z.object({
  where: Prompt_commentsWhereInputSchema.optional(), 
  limit: z.number().optional(),
}).strict();