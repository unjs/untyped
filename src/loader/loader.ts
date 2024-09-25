import { defu } from "defu";
import { createJiti, type JitiOptions } from "jiti";
import { resolveSchema } from "../schema";
import type { InputObject, Schema } from "../types";
import untypedPlugin from "./babel";

export interface LoaderOptions {
  jiti?: JitiOptions;
  defaults?: Record<string, any>;
  ignoreDefaults?: boolean;
}

export async function loadSchema(
  entryPath: string,
  options: LoaderOptions = {},
): Promise<Schema> {
  const jiti = createJiti(
    process.cwd(),
    defu(options.jiti, {
      interopDefault: true,
      transformOptions: {
        babel: {
          plugins: [[untypedPlugin, { experimentalFunctions: true }]],
        },
      },
    } satisfies JitiOptions),
  );

  const rawSchema = (await jiti.import(entryPath)) as InputObject;
  const schema = await resolveSchema(rawSchema, options.defaults, {
    ignoreDefaults: options.ignoreDefaults,
  });

  return schema;
}
