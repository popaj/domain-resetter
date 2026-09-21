import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SRC_DIR = join(ROOT, "src");
const DIST_DIR = join(ROOT, "dist");

async function build() {
  console.log("🔨 Building Domain Resetter...\n");

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
