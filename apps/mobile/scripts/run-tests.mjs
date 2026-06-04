import { spawn } from "node:child_process";
import { readdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedTestBuildFolderPattern = /^(?:\.test-build(?:-.+)?|\.codex-test-build-.+)$/;

async function cleanGeneratedTestBuildFolders() {
  const entries = await readdir(projectRoot, { withFileTypes: true });
  const generatedTestBuildFolders = entries
    .filter((entry) => entry.isDirectory() && generatedTestBuildFolderPattern.test(entry.name))
    .map((entry) => resolve(projectRoot, entry.name));

  await Promise.all(
    generatedTestBuildFolders.map((folder) => rm(folder, { recursive: true, force: true })),
  );
}

function run(command, args) {
  return new Promise((resolveExitCode) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("close", (code) => resolveExitCode(code ?? 1));
    child.on("error", () => resolveExitCode(1));
  });
}

let exitCode = 0;

try {
  await cleanGeneratedTestBuildFolders();

  const compileExitCode = await run("tsc", ["-p", "tsconfig.test.json"]);
  if (compileExitCode !== 0) {
    exitCode = compileExitCode;
  } else {
    exitCode = await run("node", ["--test", ".test-build/src"]);
  }
} finally {
  await cleanGeneratedTestBuildFolders();
}

process.exitCode = exitCode;
