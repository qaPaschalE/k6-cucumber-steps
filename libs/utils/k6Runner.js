import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { v4 as uuidv4 } from "uuid";

export function generateK6Script(scriptContent, scriptType = "k6") {
  const tempFileName = `${scriptType}_script_${uuidv4()}.js`;
  const tempFilePath = path.join(process.cwd(), "tmp", tempFileName);

  // Ensure the directory exists and write the script content
  fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
  fs.writeFileSync(tempFilePath, scriptContent);
  return tempFilePath;
}

async function runK6Script(scriptPath) {
  return new Promise((resolve, reject) => {
    exec(`k6 run ${scriptPath}`, (error, stdout, stderr) => {
      // Always clean up temp file
      fs.unlink(scriptPath, (unlinkErr) => {
        if (unlinkErr) {
          console.warn(`Failed to delete temp script: ${unlinkErr.message}`);
        }
      });

      if (error) {
        console.error("k6 run failed:", stderr);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

module.exports = {
  generateK6Script,
  runK6Script,
};
