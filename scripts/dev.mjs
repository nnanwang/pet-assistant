import { spawn } from "node:child_process";
import { readdirSync, watchFile, unwatchFile } from "node:fs";

const children = new Set();
let stopping = false;
let restartingApi = false;
const apiArgs = [
  "--env-file-if-exists=.env",
  "--import",
  "tsx",
  "server/index.ts",
];
function start(args, isApi = false) {
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  children.add(child);
  child.on("error", () => stop(1));
  child.on("exit", (code) => {
    children.delete(child);
    if (!(isApi && restartingApi)) stop(code || 0);
  });
  return child;
}
let api = start(apiArgs, true);
start([
  "node_modules/expo/bin/cli",
  "start",
  "--port",
  process.env.EXPO_PORT || "8082",
]);
// Poll exact source/config files so Metro/Xcode filesystem events do not restart the API.
const watchedFiles = [
  ".env",
  ...["server", "shared"].flatMap((directory) =>
    readdirSync(directory)
      .filter((file) => file.endsWith(".ts"))
      .map((file) => `${directory}/${file}`),
  ),
];
for (const watchedFile of watchedFiles)
  watchFile(
    watchedFile,
    { interval: 1000, persistent: false },
    (now, before) => {
      if (stopping || restartingApi || now.mtimeMs === before.mtimeMs) return;
      restartingApi = true;
      api.once("exit", () => {
        if (!stopping) {
          api = start(apiArgs, true);
          restartingApi = false;
        }
      });
      api.kill("SIGTERM");
    },
  );
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  watchedFiles.forEach((file) => unwatchFile(file));
  children.forEach((child) => child.kill("SIGTERM"));
  process.exitCode = code;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
