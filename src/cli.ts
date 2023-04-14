#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import mri from "mri";

async function main() {
  const args = mri(process.argv.slice(2));
  const [action, entryPath] = args._;

  if (action !== "load" || !entryPath) {
    console.error("Usage: untyped load <entryPath> [--write]");
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  }

  const { loadSchema } = await import("./loader/loader");
  const schema = await loadSchema(entryPath, {
    ignoreDefaults: args.ignoreDefaults,
  });
  if (args.write) {
    const json = JSON.stringify(schema, null, 2);
    const outfile = resolve(
      process.cwd(),
      args.write === true ? "schema.json" : args.write
    );
    await writeFile(outfile, json);
  } else {
    console.log(schema);
  }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
});
