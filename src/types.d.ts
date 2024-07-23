export * from "src/types/handlers";
export * from "src/types/obsidian-objects";
export * from "src/types/plugins";
export * from "src/types/results";

export type PluginSettings = {
  frontmatterKey: string;
};

/**
 * A TypeScript type alias called `Prettify`.
 * It takes a type as its argument and returns a new type that has the same properties as the original type,
 * but the properties are not intersected. This means that the new type is easier to read and understand.
 */
export type Prettify<T> =
  & { [K in keyof T]: T[K] extends object ? Prettify<T[K]> : T[K] }
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  & unknown;
