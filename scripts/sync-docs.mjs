import { execFileSync } from "node:child_process";
import { readFile, writeFile, mkdir, rm, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frozen = process.argv.includes("--frozen");
const source = path.resolve(
  process.argv[2] || path.join(root, "..", "oneringai"),
);
const git = (...args) =>
  execFileSync("git", ["-C", source, ...args], { encoding: "utf8" }).trim();
if (git("status", "--porcelain", "--untracked-files=no"))
  throw new Error(
    "Commit library changes before taking a documentation snapshot.",
  );
const tracked = git("ls-files", "-z").split("\0").filter(Boolean);
const allowed = (f) =>
  /^(README\.md|USER_GUIDE\.md|API_REFERENCE\.md|AGENTS\.md|CHANGELOG\.md|CONTRIBUTING\.md|RELEASING\.md|CLAUDE\.md|LICENSING\.md|LICENSE|MCP_INTEGRATION\.md|MULTIMODAL_ARCHITECTURE\.md|docs\/|examples\/|src\/|apps\/(amos|hosea)\/|apps\/(LICENSE|NOTICE)|scripts\/(verify-release-consumer\.mjs|release\/audit-policy\.mjs)|tests\/(fixtures\/agentic-baseline\/|unit\/(apps\/amos\/AgenticBaseline\.test\.ts|core\/evidence\/EvidenceStorage\.test\.ts)))/.test(
    f,
  ) &&
  !/(^|\/)(node_modules|dist|\.env[^/]*|\.npmrc|credentials|secrets)(\/|$)/i.test(
    f,
  ) &&
  /\.(md|ts|js|mjs|json|png|svg|jpg|jpeg|webp|ya?ml|txt|csv)$|(^|\/)(LICENSE|NOTICE)$/.test(
    f,
  );
// Include tracked documentation and runnable example/source references. Never read the environment.
const files = tracked.filter(allowed);
const dest = path.join(root, "content/library");
await rm(dest, { recursive: true, force: true });
for (const f of files) {
  await mkdir(path.dirname(path.join(dest, f)), { recursive: true });
  await copyFile(path.join(source, f), path.join(dest, f));
}
const pkg = JSON.parse(
  await readFile(path.join(source, "package.json"), "utf8"),
);
if (frozen) {
  const manifest = JSON.parse(
    await readFile(path.join(root, "content/library.json"), "utf8"),
  );
  if (
    manifest.commit !== git("rev-parse", "HEAD") ||
    manifest.version !== pkg.version
  )
    throw new Error(
      "Library checkout does not match the recorded documentation snapshot.",
    );
} else
  await writeFile(
    path.join(root, "content/library.json"),
    JSON.stringify(
      {
        repository: "https://github.com/aantich/oneringai",
        commit: git("rev-parse", "HEAD"),
        version: pkg.version,
        syncedAt: new Date().toISOString().slice(0, 10),
        files: files.length,
      },
      null,
      2,
    ) + "\n",
  );
console.log(
  `Snapshotted ${files.length} tracked files from ${git("rev-parse", "--short", "HEAD")} (${pkg.version}).`,
);
