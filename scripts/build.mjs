import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC_DIR = join(ROOT, "src");
const DIST_DIR = join(ROOT, "dist");

async function processDirectory(srcDir, distDir) {
  await mkdir(distDir, { recursive: true });

  const entries = await readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const distPath = join(distDir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(srcPath, distPath);
      continue;
    }

    if (entry.name.endsWith(".js")) {
      const source = await readFile(srcPath, "utf8");

      const result = await transform(source, {
        loader: "js",
        minify: true,
        target: "es2020"
      });

      await writeFile(distPath, result.code);
      continue;
    }

    if (entry.name.endsWith(".css")) {
      const source = await readFile(srcPath, "utf8");

      const result = await transform(source, {
        loader: "css",
        minify: true
      });

      await writeFile(distPath, result.code);
      continue;
    }

    await cp(srcPath, distPath);
  }
}

async function build() {
  console.log("🔨 Building Domain Resetter...\n");

  const packageJson = JSON.parse(
    await readFile(join(ROOT, "package.json"), "utf8")
  );

  const version = packageJson.version;

  if (!version) {
    throw new Error("Version is missing from package.json.");
  }

  console.log(`📌 Version: ${version}`);

  console.log("🧹 Cleaning dist/...");
  await rm(DIST_DIR, { recursive: true, force: true });

  await mkdir(DIST_DIR, { recursive: true });

  console.log("📦 Copying and processing extension files...");
  await processDirectory(SRC_DIR, DIST_DIR);

  const manifestPath = join(DIST_DIR, "manifest.json");

  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8")
  );

  manifest.version = version;

  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  console.log(`📝 Manifest version: ${version}`);
  console.log("🗜️  JavaScript and CSS minified automatically.");

  console.log("\n✅ Build complete.");
  console.log(`📁 Output: ${DIST_DIR}`);
}

try {
  await build();
} catch (error) {
  console.error("\n❌ Build failed.");
  console.error(error);
  process.exit(1);
}
