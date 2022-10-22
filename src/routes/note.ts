import { z } from "zod";
import { STRINGS } from "../constants";
import { AnyParams, RoutePath, RouteSubpath } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  HandlerFailure,
  HandlerFileSuccess,
  HandlerTextSuccess,
} from "../types";
import {
  appendNote,
  createNote,
  createOrOverwriteNote,
  getNoteContent,
  prependNote,
  searchAndReplaceInNote,
} from "../utils/file-handling";
import { helloRoute } from "../utils/routing";
import {
  extractNoteContentParts,
  parseStringIntoRegex,
  unwrapFrontMatter,
} from "../utils/string-handling";
import { zodOptionalBoolean, zodSanitizedFilePath } from "../utils/zod";

// SCHEMATA ----------------------------------------

const readParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type ReadParams = z.infer<typeof readParams>;

const createParams = incomingBaseParams.extend({
  content: z.string().optional(),
  file: zodSanitizedFilePath,
  overwrite: zodOptionalBoolean,
  silent: zodOptionalBoolean,
});
type CreateParams = z.infer<typeof createParams>;

const appendParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
});
type AppendParams = z.infer<typeof appendParams>;

const prependParams = incomingBaseParams.extend({
  content: z.string(),
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  "ensure-newline": zodOptionalBoolean,
  "ignore-front-matter": zodOptionalBoolean,
});
type PrependParams = z.infer<typeof prependParams>;

const searchAndReplaceParams = incomingBaseParams.extend({
  file: zodSanitizedFilePath,
  silent: zodOptionalBoolean,
  search: z.string().min(1, { message: "can't be empty" }),
  replace: z.string(),
});
type SearchAndReplaceParams = z.infer<typeof searchAndReplaceParams>;

export type AnyLocalParams =
  | ReadParams
  | CreateParams
  | AppendParams
  | PrependParams
  | SearchAndReplaceParams;

// ROUTES ----------------------------------------

export const routePath: RoutePath = {
  "/note": [
    // ## `/note`
    //
    // Does nothing but say hello.
    helloRoute(),

    // ## `/note/get`
    //
    // TODO
    //
    // {
    //     "call-id"?: string | undefined;
    //     "debug-mode"?: boolean | undefined;
    //     "x-error": string;
    //     "x-success": string;
    //     action: string;
    //     file: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerFileSuccess | HandlerFailure
    { path: "/get", schema: readParams, handler: handleGet },

    // ## `/note/create`
    //
    // TODO
    //
    //   {
    //     "call-id"?: string | undefined;
    //     "debug-mode"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     content?: string | undefined;
    //     file: string;
    //     overwrite?: boolean | undefined;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess | HandlerFailure
    { path: "/create", schema: createParams, handler: handleCreate },

    // ## `/note/append`
    //
    // TODO
    //
    //   {
    //     "call-id"?: string | undefined;
    //     "debug-mode"?: boolean | undefined;
    //     "ensure-newline"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     content: string;
    //     file: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess | HandlerFailure
    { path: "/append", schema: appendParams, handler: handleAppend },

    // ## `/note/prepend`
    //
    // TODO
    //
    //   {
    //     "call-id"?: string | undefined;
    //     "debug-mode"?: boolean | undefined;
    //     "ensure-newline"?: boolean | undefined;
    //     "ignore-front-matter": boolean;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     content: string;
    //     file: string;
    //     silent?: boolean | undefined;
    // }
    // => HandlerTextSuccess | HandlerFailure
    { path: "/prepend", schema: prependParams, handler: handlePrepend },

    // ## `/note/search-string-and-replace`
    //
    // TODO
    //
    //   {
    //     "call-id"?: string | undefined;
    //     "debug-mode"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     file: string;
    //     replace: string;
    //     search: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess | HandlerFailure
    {
      path: "/search-string-and-replace",
      schema: searchAndReplaceParams,
      handler: handleSearchStringAndReplace,
    },

    // ## `/note/search-regex-and-replace`
    //
    // TODO
    //
    //   {
    //     "call-id"?: string | undefined;
    //     "debug-mode"?: boolean | undefined;
    //     "x-error"?: string | undefined;
    //     "x-success"?: string | undefined;
    //     action: string;
    //     file: string;
    //     replace: string;
    //     search: string;
    //     silent?: boolean | undefined;
    //     vault: string;
    // }
    // => HandlerTextSuccess | HandlerFailure
    {
      path: "/search-regex-and-replace",
      schema: searchAndReplaceParams,
      handler: handleSearchRegexAndReplace,
    },
  ],
};

// HANDLERS ----------------------------------------

async function handleGet(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <ReadParams> incomingParams;
  const { file } = params;
  const res = await getNoteContent(file);

  if (res.isSuccess) {
    const content = res.result;
    const { body, frontMatter } = extractNoteContentParts(content);

    return <HandlerFileSuccess> {
      isSuccess: true,
      result: {
        filepath: file,
        content,
        body,
        "front-matter": unwrapFrontMatter(frontMatter),
      },
      processedFilepath: file,
    };
  }

  return <HandlerFailure> res;
}

async function handleCreate(
  incomingParams: AnyParams,
): Promise<HandlerFileSuccess | HandlerFailure> {
  const params = <CreateParams> incomingParams;
  const { file, content, overwrite } = params;

  const res = overwrite
    ? await createOrOverwriteNote(file, content || "")
    : await createNote(file, content || "");
  if (!res.isSuccess) {
    return <HandlerFailure> res;
  }

  const newNoteRes = await getNoteContent(file);
  if (!newNoteRes.isSuccess) {
    return <HandlerFailure> newNoteRes;
  }

  return <HandlerFileSuccess> {
    isSuccess: true,
    result: {
      ...extractNoteContentParts(newNoteRes.result),
      content: newNoteRes.result,
      filepath: file,
    },
    processedFilepath: file,
  };
}

async function handleAppend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <AppendParams> incomingParams;
  const { file, content } = params;
  const res = await appendNote(file, content, params["ensure-newline"]);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : <HandlerFailure> res;
}

async function handlePrepend(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <PrependParams> incomingParams;
  const { file, content } = params;
  const res = await prependNote(
    file,
    content,
    params["ensure-newline"],
    params["ignore-front-matter"],
  );

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : <HandlerFailure> res;
}

async function handleSearchStringAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const { search, file, replace } = params;
  const regex = new RegExp(search, "g");
  const res = await searchAndReplaceInNote(file, regex, replace);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : <HandlerFailure> res;
}

async function handleSearchRegexAndReplace(
  incomingParams: AnyParams,
): Promise<HandlerTextSuccess | HandlerFailure> {
  const params = <SearchAndReplaceParams> incomingParams;
  const { search, file, replace } = params;
  const resSir = parseStringIntoRegex(search);

  if (!resSir.isSuccess) {
    return <HandlerFailure> resSir;
  }

  const res = await searchAndReplaceInNote(file, resSir.result, replace);

  return res.isSuccess
    ? <HandlerTextSuccess> {
      isSuccess: true,
      result: { message: res.result },
      processedFilepath: file,
    }
    : <HandlerFailure> res;
}
