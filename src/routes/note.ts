import { Vault } from "obsidian";
import { z } from "zod";
import {
  createNote,
  createOrOverwriteNote,
  getNoteContent,
} from "../utils/file-handling";
import {
  basePayloadSchema,
  zodOptionalBoolean,
  zodSanitizedFilePath,
} from "../schemata";
import { helloRoute } from "../utils/routing";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
  Route,
  ZodSafeParseSuccessData,
} from "../types";

// SCHEMATA --------------------
// NOTE: I don't use zod's `.extend()` method below because I find the VS Code
// lookups easier to read when the objects are defined using spread syntax. 🤷🏻‍♂️

const CreatePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});

const ReadPayload = z.object({
  ...basePayloadSchema,
  file: zodSanitizedFilePath,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});

const WritePayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
});

const PrependPayload = z.object({
  ...basePayloadSchema,
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});

const SearchAndReplacePayload = z.object({
  ...basePayloadSchema,
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});

export type PayloadUnion =
  | z.infer<typeof CreatePayload>
  | z.infer<typeof ReadPayload>
  | z.infer<typeof WritePayload>
  | z.infer<typeof PrependPayload>
  | z.infer<typeof SearchAndReplacePayload>;

// ROUTES --------------------

console.log(basePayloadSchema);

export const routes: Route[] = [
  helloRoute("note"),
  { path: "note/get", schema: ReadPayload, handler: handleNoteGet },
  { path: "note/create", schema: CreatePayload, handler: handleNoteCreate },
  { path: "note/append", schema: WritePayload, handler: handleNoteAppend },
  { path: "note/prepend", schema: PrependPayload, handler: handleNotePrepend },
  {
    path: "note/search-string-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleNoteSearchStringAndReplace,
  },
  {
    path: "note/search-regex-and-replace",
    schema: SearchAndReplacePayload,
    handler: handleNoteSearchRegexAndReplace,
  },
];

// HANDLERS --------------------

async function handleNoteGet(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof ReadPayload>;
  const { file } = payload;
  const content = await getNoteContent(file, vault);

  return content
    ? <HandlerFileSuccess> {
      success: true,
      data: { file, content },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: "Note not found",
      input: payload,
    };
}

async function handleNoteCreate(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof CreatePayload>;
  const { file, content, overwrite } = payload;

  const result = overwrite
    ? await createOrOverwriteNote(file, content || "", vault)
    : await createNote(file, content || "", vault);

  return result
    ? <HandlerTextSuccess> {
      success: true,
      data: { result: file },
      input: payload,
    }
    : <HandlerFailure> {
      success: false,
      error: "Note couldn't be written",
      input: payload,
    };
}

// TODO: handleNoteAppend()
async function handleNoteAppend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof WritePayload>;
  console.log("handleNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleNotePrepend()
async function handleNotePrepend(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof WritePayload>;
  console.log("handleNotePrepend", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleNoteSearchStringAndReplace()
async function handleNoteSearchStringAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  console.log("handleNoteSearchStringAndReplace", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}

// TODO: handleNoteSearchRegexAndReplace()
async function handleNoteSearchRegexAndReplace(
  data: ZodSafeParseSuccessData,
  vault: Vault,
): Promise<AnyHandlerResult> {
  const payload = data as z.infer<typeof SearchAndReplacePayload>;
  console.log("handleNoteSearchRegexAndReplace", payload);
  return <HandlerTextSuccess> {
    success: true,
    data: { result: "" },
    input: payload,
  };
}
