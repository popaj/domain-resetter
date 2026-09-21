import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC_DIR = join(ROOT, "src");
const DIST_DIR = join(ROOT, "dist");

async function build() {
  console.log("🔨 Building Domain Resetter...\n");

  // Read the project version from package.json.
  const packageJson = JSON.parse(
    await readFile(join(ROOT, "package.json"), "utf8")
  );

  const version = packageJson.version;

  if (!version) {
    throw new Error("Version is missing from package.json.");
  }

  console.log(`📌 Version: ${version}`);

  // Always start from a clean distribution directory.
  console.log("🧹 Cleaning dist/...");
  await rm(DIST_DIR, { recursive: true, force: true });

  // Create dist/.
  await mkdir(DIST_DIR, { recursive: true });

  // Copy the complete extension source tree.
  console.log("📦 Copying extension files...");
  await cp(SRC_DIR, DIST_DIR, {
    recursive: true,
  });

  // Inject package.json version into the generated manifest.
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
