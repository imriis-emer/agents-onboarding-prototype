#!/usr/bin/env node
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const framesDir = path.join(root, "exports", "loader-gif-frames");
const outputDir = path.join(root, "exports", "loaders");
const canvasDimensionsFile = path.join(
  root,
  "src/data/loaderCanvasDimensions.ts",
);

const FPS = 12;
const FRAME_MS = 1000 / FPS;
const CYCLES = Number(process.env.LOADER_GIF_CYCLES || 1);
const SIZE = process.env.LOADER_GIF_SIZE || "large";
const EXPORT_FORMAT = process.env.LOADER_EXPORT_FORMAT || "gif";
const PORT = 3456;

const SIZE_CONFIG = {
  default: {
    deviceScaleFactor: 2,
    initialViewport: { width: 480, height: 120 },
  },
  large: {
    deviceScaleFactor: 2,
    initialViewport: { width: 720, height: 180 },
  },
};

const VARIANTS = [
  { id: "account", basename: "account-creating-loader-large" },
  { id: "jade", basename: "jade-loader-large" },
  { id: "lia", basename: "lia-loader-large" },
  { id: "general", basename: "general-loader-large" },
];

const VARIANT_FILTER = process.env.LOADER_GIF_VARIANT;
const VARIANTS_TO_EXPORT = VARIANT_FILTER
  ? VARIANTS.filter((variant) => variant.id === VARIANT_FILTER)
  : VARIANTS;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".gif": "image/gif",
  ".png": "image/png",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const pathname = (req.url ?? "/").split("?")[0];
        const relativePath = pathname === "/" ? "/loader-export.html" : pathname;
        const filePath = path.join(publicDir, relativePath);

        if (!filePath.startsWith(publicDir) || !existsSync(filePath)) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }

        const ext = path.extname(filePath);
        const body = await readFile(filePath);
        res.writeHead(200, {
          "Content-Type": MIME_TYPES[ext] ?? "application/octet-stream",
        });
        res.end(body);
      } catch {
        res.writeHead(500);
        res.end("Server error");
      }
    });

    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function runFfmpegGif(inputPattern, outputPath, outputWidth) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      inputPattern,
      "-vf",
      `fps=${FPS},scale=${outputWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3`,
      outputPath,
    ];

    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`ffmpeg gif exited with code ${code}`));
    });
  });
}

function runFfmpegMp4(inputPattern, outputPath, outputWidth, outputHeight) {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      inputPattern,
      "-vf",
      `scale=${outputWidth}:${outputHeight}:flags=lanczos`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      outputPath,
    ];

    const proc = spawn("ffmpeg", args, { stdio: "inherit" });
    proc.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`ffmpeg mp4 exited with code ${code}`));
    });
  });
}

function shouldExportGif() {
  return EXPORT_FORMAT === "gif" || EXPORT_FORMAT === "both";
}

function shouldExportMp4() {
  return EXPORT_FORMAT === "mp4" || EXPORT_FORMAT === "both";
}

async function resolveChromePath(puppeteer) {
  const envPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envPath && !/not found/i.test(envPath) && existsSync(envPath)) {
    return envPath;
  }

  const systemChrome =
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (existsSync(systemChrome)) {
    return systemChrome;
  }

  try {
    const configuredPath = await puppeteer.executablePath();
    if (configuredPath && !/not found/i.test(configuredPath)) {
      return configuredPath;
    }
  } catch {
    // Fall through.
  }

  throw new Error(
    "Chrome not found. Run `npx puppeteer browsers install chrome` or set PUPPETEER_EXECUTABLE_PATH.",
  );
}

async function loadExportPage(page, query, sizeConfig) {
  const { deviceScaleFactor, initialViewport } = sizeConfig;

  await page.setViewport({
    ...initialViewport,
    deviceScaleFactor,
  });
  await page.goto(`http://127.0.0.1:${PORT}/loader-export.html?${query}`, {
    waitUntil: "networkidle0",
  });
}

async function measureVariantWidth(page, id, sizeConfig) {
  await loadExportPage(
    page,
    `variant=${id}&size=${SIZE}&mode=measure-width`,
    sizeConfig,
  );
  await page.waitForFunction(() => window.__LOADER_MEASURE_READY__ === true);
  return page.evaluate(() => window.__LOADER_MEASURED_WIDTH__);
}

async function measureVariantHeight(page, id, canvasWidth, sizeConfig) {
  await loadExportPage(
    page,
    `variant=${id}&size=${SIZE}&mode=measure-height&canvasWidth=${canvasWidth}`,
    sizeConfig,
  );
  await page.waitForFunction(() => window.__LOADER_MEASURE_READY__ === true);
  return page.evaluate(() => window.__LOADER_MEASURED_HEIGHT__);
}

async function resolveUnifiedCanvas(page, variants, sizeConfig) {
  const widths = [];

  for (const variant of variants) {
    const width = await measureVariantWidth(page, variant.id, sizeConfig);
    console.log(`Measured ${variant.id} natural width: ${width}px`);
    widths.push(width);
  }

  const unifiedWidth = Math.max(...widths);

  const heights = [];
  for (const variant of variants) {
    const height = await measureVariantHeight(
      page,
      variant.id,
      unifiedWidth,
      sizeConfig,
    );
    console.log(
      `Measured ${variant.id} height at ${unifiedWidth}px: ${height}px`,
    );
    heights.push(height);
  }

  const unifiedHeight = Math.max(...heights);
  const widestVariant = variants[widths.indexOf(unifiedWidth)]?.id ?? "unknown";

  console.log(
    `Unified canvas: ${unifiedWidth}x${unifiedHeight}px (widest: ${widestVariant})`,
  );

  return { width: unifiedWidth, height: unifiedHeight };
}

async function writeCanvasDimensions({ width, height }) {
  const contents = `/** Generated by scripts/export-loader-gif.mjs — do not edit manually. */\nexport const LOADER_CANVAS_WIDTH_PX = ${width};\nexport const LOADER_CANVAS_HEIGHT_PX = ${height};\n`;
  await writeFile(canvasDimensionsFile, contents);
}

async function exportVariant(page, { id, basename }, sizeConfig, canvas) {
  const variantFramesDir = path.join(framesDir, id);
  await rm(variantFramesDir, { recursive: true, force: true });
  await mkdir(variantFramesDir, { recursive: true });

  const { deviceScaleFactor } = sizeConfig;

  await loadExportPage(
    page,
    `cycles=${CYCLES}&variant=${id}&size=${SIZE}&canvasWidth=${canvas.width}&canvasHeight=${canvas.height}`,
    sizeConfig,
  );
  await page.waitForFunction(() => window.__LOADER_EXPORT_READY__ === true);

  const dimensions = await page.evaluate(() => window.__LOADER_EXPORT_DIMENSIONS__);
  await page.setViewport({
    width: dimensions.width,
    height: dimensions.height,
    deviceScaleFactor,
  });
  await page.evaluate(() => window.__LOADER_START_ANIMATION__());
  await sleep(100);

  let frame = 0;
  let done = false;

  while (!done) {
    const frameStart = Date.now();
    const framePath = path.join(
      variantFramesDir,
      `frame_${String(frame).padStart(4, "0")}.png`,
    );
    await page.screenshot({ path: framePath, type: "png" });
    frame += 1;

    done = await page.evaluate(() => window.__LOADER_EXPORT_DONE__ === true);
    if (done) break;

    const elapsed = Date.now() - frameStart;
    await sleep(Math.max(0, FRAME_MS - elapsed));
  }

  await page.screenshot({
    path: path.join(
      variantFramesDir,
      `frame_${String(frame).padStart(4, "0")}.png`,
    ),
    type: "png",
  });

  const framePattern = path.join(variantFramesDir, "frame_%04d.png");
  const outputWidth = dimensions.width * deviceScaleFactor;
  const outputHeight = dimensions.height * deviceScaleFactor;
  const outputs = [];

  if (shouldExportGif()) {
    const outputGif = path.join(outputDir, `${basename}.gif`);
    await runFfmpegGif(framePattern, outputGif, outputWidth);
    outputs.push(outputGif);
  }

  if (shouldExportMp4()) {
    const outputMp4 = path.join(outputDir, `${basename}.mp4`);
    await runFfmpegMp4(framePattern, outputMp4, outputWidth, outputHeight);
    outputs.push(outputMp4);
  }

  await rm(variantFramesDir, { recursive: true, force: true });

  console.log(
    `Exported ${frame + 1} frames (${dimensions.width}x${dimensions.height}px) to ${outputs.join(", ")}`,
  );
}

async function main() {
  const sizeConfig = SIZE_CONFIG[SIZE];
  if (!sizeConfig) {
    throw new Error(`Unknown LOADER_GIF_SIZE "${SIZE}". Use "default" or "large".`);
  }

  if (VARIANTS_TO_EXPORT.length === 0) {
    throw new Error(
      `Unknown LOADER_GIF_VARIANT "${VARIANT_FILTER}". Use one of: ${VARIANTS.map((variant) => variant.id).join(", ")}.`,
    );
  }

  if (!shouldExportGif() && !shouldExportMp4()) {
    throw new Error(
      `Unknown LOADER_EXPORT_FORMAT "${EXPORT_FORMAT}". Use "gif", "mp4", or "both".`,
    );
  }

  const puppeteer = await import("puppeteer");

  await rm(framesDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const server = await startStaticServer();
  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath: await resolveChromePath(puppeteer.default),
  });
  const page = await browser.newPage();

  const canvas = await resolveUnifiedCanvas(page, VARIANTS, sizeConfig);
  await writeCanvasDimensions(canvas);

  for (const variant of VARIANTS_TO_EXPORT) {
    await exportVariant(page, variant, sizeConfig, canvas);
  }

  await browser.close();
  server.close();
  await rm(framesDir, { recursive: true, force: true });

  console.log(`Done. Loaders saved to ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
