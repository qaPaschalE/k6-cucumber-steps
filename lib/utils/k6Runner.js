const path = require("path");
const { exec } = require("child_process");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises; // Use promises for cleaner async/await
const packageJson = require("../../package.json"); // Access package version

/**
 * Generates a temporary k6 script file.
 * @param {string} scriptContent - The content of the k6 script.
 * @param {string} [scriptType='load'] - Type of script (e.g., 'load').
 * @param {boolean} [overwrite=false] - Whether to overwrite the report file.
 * @returns {Promise<string>} - Path to the generated k6 script file.
 */
const generateK6Script = async (
  scriptContent,
  scriptType = "load",
  overwrite = false
) => {
  const tempDir = path.resolve(__dirname, "../../temp");
  const scriptName = `${scriptType}_script_${uuidv4()}.js`;
  const scriptPath = path.join(tempDir, scriptName);

  try {
    await fs.mkdir(tempDir, { recursive: true }); // Ensure temp directory exists

    // Write the script content based on the overwrite flag
    if (overwrite) {
      await fs.writeFile(scriptPath, scriptContent, { flag: "w" }); // Overwrite mode
    } else {
      await fs.appendFile(scriptPath, scriptContent); // Append mode
    }

    return scriptPath;
  } catch (error) {
    console.error(`Error generating k6 script: ${error.message}`);
    throw error;
  }
};

/**
 * Introduce a delay in milliseconds.
 * @param {number} ms - The duration of the delay in milliseconds.
 * @returns {Promise<void>} - A Promise that resolves after the delay.
 */
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Runs the k6 script with custom branding.
 * @param {string} scriptPath - Path to the k6 script file.
 * @param {boolean} [overwrite=false] - Whether to overwrite the report file.
 * @returns {Promise<string>} - Standard output from k6 execution.
 */
const runK6Script = async (scriptPath, overwrite = false) => {
  // ANSI escape codes for colors
  const chalkGreen = "\x1b[38;2;0;255;0m"; // Green
  const chalkYellow = "\x1b[38;2;255;255;0m"; // Yellow
  const resetColor = "\x1b[0m";

  // Custom logo with version information
  const customLogo = `${chalkGreen} with @qaPaschalE's ${chalkYellow}k6-cucumber-steps v${packageJson.version}${resetColor}`;

  return new Promise(async (resolve, reject) => {
    exec(`k6 run "${scriptPath}"`, async (error, stdout, stderr) => {
      // Split the k6 logo lines
      const logoLines = stdout.split("\n");

      // Insert the custom logo under "Grafana" (on the third line)
      let modifiedStdout = "";
      for (let i = 0; i < logoLines.length; i++) {
        modifiedStdout += logoLines[i];
        if (i === 5) {
          // Target the third line (index 2) of the k6 logo
          modifiedStdout += `   ${customLogo}\n`;
        }
        modifiedStdout += "\n";
      }

      // Handle errors and cleanup
      if (error) {
        console.error("k6 error:", error);
        console.error("k6 stdout:", modifiedStdout);
        await delay(3000); // Wait for 3 seconds
        console.error("k6 stderr:", stderr);
        reject(new Error(`k6 test execution failed: ${error.message}`));
      } else if (stderr) {
        console.log("k6 stdout:", modifiedStdout);
        await delay(3000); // Wait for 3 seconds
        resolve(stdout);
      } else {
        console.log("k6 stdout:", modifiedStdout);
        await delay(3000); // Wait for 3 seconds
        resolve(stdout);
      }

      // Clean up the temporary script file
      fs.unlink(scriptPath).catch((err) =>
        console.error("Error deleting temporary k6 script:", err)
      );
    });
  });
};

module.exports = { generateK6Script, runK6Script };
