import { z } from "zod";
import { AnyParams, Route } from "../routes";
import { incomingBaseParams } from "../schemata";
import {
  AnyHandlerResult,
  HandlerFailure,
  HandlerSearchSuccess,
} from "../types";
import { helloRoute, namespaceRoutes } from "../utils/routing";
import { doSearch } from "../utils/search";

// SCHEMATA --------------------

const defaultParams = incomingBaseParams.extend({
  query: z.string().min(1, { message: "can't be empty" }),
  "x-error": z.string().url(),
  "x-success": z.string().url(),
});
type DefaultParams = z.infer<typeof defaultParams>;

export type AnyLocalParams = DefaultParams;

// ROUTES --------------------

export const routes: Route[] = namespaceRoutes("search", [
  // ## `/search`
  //
  // Does nothing but say hello.
  helloRoute(),

  // ## `/search/all-notes`
  //
  // Returns search results (file paths) for a given search query.
  //
  //   {
  //     "call-id"?: string | undefined;
  //     "debug-mode"?: boolean | undefined;
  //     "x-error": string;
  //     "x-success": string;
  //     action: string;
  //     query: string;
  //     vault: string;
  // }
  // => HandlerSearchSuccess | HandlerFailure
  { path: "all-notes", schema: defaultParams, handler: handleSearch },
]);

// HANDLERS --------------------

async function handleSearch(
  incomingParams: AnyParams,
): Promise<HandlerSearchSuccess | HandlerFailure> {
  const params = <DefaultParams> incomingParams;
  const res = await doSearch(params.query);

  return res.isSuccess
    ? <HandlerSearchSuccess> {
      isSuccess: true,
      result: res.result,
    }
    : <HandlerFailure> {
      isSuccess: false,
      error: res.error,
    };
}
