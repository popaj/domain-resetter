import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";
import { minify as minifyHtml } from "html-minifier-terser";

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

    const extension = entry.name.split(".").pop()?.toLowerCase();

    if (extension === "js") {
      const source = await readFile(srcPath, "utf8");

      const result = await transform(source, {
        loader: "js",
        minify: true,
        target: "es2020",
      });

      await writeFile(distPath, result.code, "utf8");
      continue;
    }

    if (extension === "css") {
      const source = await readFile(srcPath, "utf8");

      const result = await transform(source, {
        loader: "css",
        minify: true,
      });

      await writeFile(distPath, result.code, "utf8");
      continue;
    }

    if (extension === "html") {
      const source = await readFile(srcPath, "utf8");

      const result = await minifyHtml(source, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true,
      });

      await writeFile(distPath, result, "utf8");
      continue;
    }

    await cp(srcPath, distPath);
  }
}

async function build() {
  console.log("🔨 Building Domain Resetter...\n");

  // Read the project version from package.json.
  const packageJson = JSON.parse(
    await readFile(join(ROOT, "package.json"), "utf8"),
  );

  const version = packageJson.version;

  if (
    typeof version !== "string" ||
    !/^\d+\.\d+\.\d+$/.test(version)
  ) {
    throw new Error(
      `Invalid package version: ${JSON.stringify(version)}`,
    );
  }

  console.log(`📌 Version: ${version}`);

  // Always start from a clean distribution directory.
  console.log("🧹 Cleaning dist/...");
  await rm(DIST_DIR, {
    recursive: true,
    force: true,
  });

  await mkdir(DIST_DIR, {
    recursive: true,
  });

  // Copy and optimize the complete extension source tree.
  console.log("📦 Processing extension files...");
  await processDirectory(SRC_DIR, DIST_DIR);

  // Inject package.json version into the generated manifest.
  const manifestPath = join(DIST_DIR, "manifest.json");

  const manifest = JSON.parse(
    await readFile(manifestPath, "utf8"),
  );

  manifest.version = version;

  await writeFile(
    manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(`📝 Manifest version: ${version}`);
  console.log("🗜️  JavaScript, CSS, and HTML minified.");

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
