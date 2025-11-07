// scripts/watch-json.js
import fs from "fs";
import path from "path";
import chokidar from "chokidar";
import * as esbuild from "esbuild";
import { pathToFileURL } from "url";

const SRC_DIR = path.resolve("data");
const OUT_DIR = path.resolve("dist/data");

fs.mkdirSync(OUT_DIR, { recursive: true });

async function loadTsModule(filePath) {
  // Compile TypeScript to JavaScript using esbuild (in-memory)
  const result = await esbuild.build({
    entryPoints: [filePath],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });

  const jsCode = result.outputFiles[0].text;

  // Write to a temporary .mjs file
  const tmpFile = path.join(
    OUT_DIR,
    `.__tmp_${path.basename(filePath, ".ts")}.mjs`
  );
  fs.writeFileSync(tmpFile, jsCode, "utf8");

  // Convert to proper file:// URL (Windows safe)
  const fileUrl = pathToFileURL(tmpFile).href + `?update=${Date.now()}`;

  // Dynamically import compiled module
  const module = await import(fileUrl);

  // Clean up temp file
  fs.unlinkSync(tmpFile);

  return module;
}

async function processFile(filePath) {
  try {
    const module = await loadTsModule(filePath);
    const [exportName, value] = Object.entries(module)[0] || [];

    if (!exportName) {
      console.warn(`⚠️ No exports found in ${filePath}`);
      return;
    }

    const outPath = path.join(
      OUT_DIR,
      path.basename(filePath, path.extname(filePath)) + ".json"
    );

    fs.writeFileSync(outPath, JSON.stringify(value, null, 2));
    console.log(`✅ Wrote ${outPath}`);
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
  }
}

function startWatcher() {
  const watcher = chokidar.watch(`${SRC_DIR}/*.ts`, { ignoreInitial: false });

  watcher
    .on("add", processFile)
    .on("change", processFile)
    .on("unlink", (filePath) => {
      const outPath = path.join(
        OUT_DIR,
        path.basename(filePath, path.extname(filePath)) + ".json"
      );
      if (fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
        console.log(`🗑️ Removed ${outPath}`);
      }
    });

  console.log(`👀 Watching ${SRC_DIR} for .ts file changes...`);
}

startWatcher();
