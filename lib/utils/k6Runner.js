import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { spawn } from "child_process";

/**
 * Generates a temporary k6 script file.
 * @param {string} scriptContent - The content of the k6 script.
 * @param {string} scriptType - The type of script (default: "k6").
 * @returns {string} - The path to the generated temporary script file.
 */
export function generateK6Script(scriptContent, scriptType = "k6") {
  const tempFileName = `${scriptType}_script_${uuidv4()}.js`;
  const tempFilePath = path.join(process.cwd(), "tmp", tempFileName);

  // Ensure the directory exists and write the script content
  fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
  fs.writeFileSync(tempFilePath, scriptContent);
  return tempFilePath;
}

/**
 * Runs the k6 script using the `k6 run` command.
 * @param {string} scriptPath - The path to the k6 script file.
 * @returns {Promise<string>} - Resolves with the stdout of the k6 execution.
 */

export async function runK6Script(scriptPath) {
  return new Promise((resolve, reject) => {
    const k6Process = spawn("k6", ["run", scriptPath]);

    let stdout = "";
    let stderr = "";

    // Capture stdout and log it in real-time
    k6Process.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log(data.toString()); // Log output in real-time
    });

    // Capture stderr and log it in real-time
    k6Process.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error(data.toString()); // Log errors in real-time
    });

    // Handle process exit
    k6Process.on("close", (code) => {
      // Always clean up temp file
      fs.unlink(scriptPath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`Failed to delete temp script: ${unlinkErr.message}`);
        }
      });

      if (code !== 0) {
        console.error("k6 run failed with code:", code);
        console.error("stderr:", stderr);
        reject(new Error(`k6 run failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    // Handle spawn errors
    k6Process.on("error", (err) => {
      console.error("Failed to start k6 process:", err.message);
      reject(err);
    });
  });
}
