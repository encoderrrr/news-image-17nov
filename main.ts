// news-image-20261117 — "Sum up 17 November's world news in one image"
//
// The entry is a single 1024x1024 newspaper-style infographic (JPEG bytes
// stored as entry.png) summing up Tuesday 17 November 2026: the US strikes
// on Iran's Qeshm Island, the Kerch bridge collapse, Nvidia's record
// quarter, the Wall Street sell-off, the Optimizely cyberattack, and more.
// This program copies the finished image into the grader's output
// directory. Node 22+, standard library only, no network access.
//
//   MAKEFUN_OUTPUT_DIR=output node main.ts
import { copyFile, mkdir, open, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(HERE, "entry.png");

// The gate tells PNG from JPEG by the first bytes, so refuse anything else.
async function checkMagicBytes(path: string): Promise<void> {
  const handle = await open(path, "r");
  try {
    const header = Buffer.alloc(8);
    await handle.read(header, 0, 8, 0);
    const isJpeg = header[0] === 0xff && header[1] === 0xd8;
    const isPng =
      header[0] === 0x89 &&
      header[1] === 0x50 &&
      header[2] === 0x4e &&
      header[3] === 0x47;
    if (!isJpeg && !isPng) {
      throw new Error(`${path} is neither a JPEG nor a PNG image`);
    }
  } finally {
    await handle.close();
  }
}

async function main(): Promise<void> {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (!outDir) {
    throw new Error("MAKEFUN_OUTPUT_DIR is not set");
  }
  await checkMagicBytes(SOURCE);
  const target = join(outDir, "entry.png");
  await mkdir(outDir, { recursive: true });
  await copyFile(SOURCE, target);
  const [srcInfo, dstInfo] = await Promise.all([stat(SOURCE), stat(target)]);
  if (srcInfo.size !== dstInfo.size) {
    throw new Error(
      `copy mismatch: source is ${srcInfo.size} bytes but wrote ${dstInfo.size}`,
    );
  }
  console.log(`wrote ${target} (${dstInfo.size} bytes)`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
