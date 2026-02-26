//src/generators/feature.parser.ts
import fs from "fs";
import path from "path";
import * as Gherkin from "@cucumber/gherkin";
import * as Messages from "@cucumber/messages";
import { FeatureFile, Scenario, Step, ScenarioMetadata } from "../types";

export class FeatureParser {
  async loadAndParseFeatures(featuresPath: string): Promise<FeatureFile[]> {
    const featureFiles: FeatureFile[] = [];

    // Handle multiple paths (comma-separated)
    const paths = featuresPath.split(',').map(p => p.trim()).filter(p => p);
    
    for (const singlePath of paths) {
      const resolvedPath = path.resolve(process.cwd(), singlePath);
      
      if (!fs.existsSync(resolvedPath)) {
        console.warn(`⚠️  Warning: The path "${singlePath}" does not exist at ${resolvedPath}`);
        continue;
      }

      if (fs.statSync(resolvedPath).isDirectory()) {
        // Recursively find all .feature files in directory
        const dirFeatureFiles = this.findFeatureFilesRecursive(resolvedPath);
        for (const file of dirFeatureFiles) {
          const content = fs.readFileSync(file, "utf8");
          featureFiles.push(this.parseFeature(content, file));
        }
      } else if (singlePath.endsWith(".feature")) {
        // Single feature file
        const content = fs.readFileSync(resolvedPath, "utf8");
        featureFiles.push(this.parseFeature(content, resolvedPath));
      } else {
        console.warn(`⚠️  Warning: "${singlePath}" is not a directory or .feature file`);
      }
    }

    if (featureFiles.length === 0) {
      throw new Error(`No feature files found in: ${featuresPath}`);
    }

    return featureFiles;
  }

  /**
   * Recursively find all .feature files in a directory
   */
  private findFeatureFilesRecursive(dirPath: string): string[] {
    const featureFiles: string[] = [];
    
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        // Recursively search subdirectories (exclude hidden and node_modules)
        featureFiles.push(...this.findFeatureFilesRecursive(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".feature")) {
        featureFiles.push(fullPath);
      }
    }
    
    return featureFiles;
  }

  private parseFeature(content: string, filePath: string): FeatureFile {
    try {
      const uuidFn = Messages.IdGenerator.incrementing();
      const builder = new Gherkin.AstBuilder(uuidFn);
      const matcher = new Gherkin.GherkinClassicTokenMatcher();
      const parser = new Gherkin.Parser(builder, matcher);

      const gherkinDocument = parser.parse(content);

      if (!gherkinDocument || !gherkinDocument.feature) {
        throw new Error("No feature found in file.");
      }

      // 1. Capture Feature-level tags for inheritance
      const featureTags = (gherkinDocument.feature.tags || []).map((tag: any) =>
        tag.name.replace("@", ""),
      );

      // 2. Extract Background Steps (to be prepended to all scenarios)
      const backgroundSteps: Step[] = [];
      const backgroundChild = gherkinDocument.feature.children.find(
        (child: any) => child.background,
      );

      if (backgroundChild && backgroundChild.background) {
        backgroundChild.background.steps.forEach((step: any) => {
          backgroundSteps.push(this.mapGherkinStepToInternalStep(step));
        });
      }

      const scenarios: Scenario[] = [];

      // 3. Process Children (Scenarios and Scenario Outlines)
      if (gherkinDocument.feature.children) {
        for (const child of gherkinDocument.feature.children) {
          if (child.scenario) {
            const scenario = child.scenario;
            const combinedTags = [
              ...featureTags,
              ...(scenario.tags || []).map((tag: any) =>
                tag.name.replace("@", ""),
              ),
            ];

            // 4. Handle Scenario Outlines (Examples)
            if (scenario.examples && scenario.examples.length > 0) {
              for (const exampleGroup of scenario.examples) {
                const tableHeader =
                  exampleGroup.tableHeader?.cells.map((c: any) => c.value) ||
                  [];
                const tableBody = exampleGroup.tableBody || [];

                tableBody.forEach((row: any, rowIndex: number) => {
                  const rowData: Record<string, string> = {};
                  row.cells.forEach((cell: any, cellIndex: number) => {
                    rowData[tableHeader[cellIndex]] = cell.value;
                  });

                  // Process steps: inject background + replace placeholders + map arguments
                  const scenarioSteps = scenario.steps.map((step: any) => {
                    let newText = step.text;
                    // Replace <placeholders>
                    Object.keys(rowData).forEach((key) => {
                      newText = newText.replace(
                        new RegExp(`<${key}>`, "g"),
                        rowData[key],
                      );
                    });

                    return this.mapGherkinStepToInternalStep(step, newText);
                  });

                  scenarios.push({
                    name: `${scenario.name} (Row ${rowIndex + 1})`,
                    steps: [...backgroundSteps, ...scenarioSteps],
                    tags: combinedTags,
                    description: scenario.description || "",
                  });
                });
              }
            } else {
              // 5. Handle Standard Scenarios
              const scenarioSteps = scenario.steps.map((step: any) =>
                this.mapGherkinStepToInternalStep(step),
              );

              scenarios.push({
                name: scenario.name,
                steps: [...backgroundSteps, ...scenarioSteps],
                tags: combinedTags,
                description: scenario.description || "",
              });
            }
          }
        }
      }

      return { path: filePath, content, scenarios };
    } catch (error: any) {
      throw new Error(
        `Error parsing feature file ${filePath}: ${error.message}`,
      );
    }
  }

  /**
   * Helper to map Gherkin AST steps to our internal Scenario Step format,
   * specifically handling DataTables and DocStrings.
   */
  private mapGherkinStepToInternalStep(
    gherkinStep: any,
    overrideText?: string,
  ): Step {
    let argument = null;

    // Handle DataTables: Convert to Array of Objects
    if (gherkinStep.dataTable) {
      const rows = gherkinStep.dataTable.rows;
      if (rows.length > 0) {
        const header = rows[0].cells.map((c: any) => c.value);
        argument = rows.slice(1).map((row: any) => {
          const obj: Record<string, string> = {};
          row.cells.forEach((cell: any, i: number) => {
            obj[header[i]] = cell.value;
          });
          return obj;
        });
      }
    }
    // Handle DocStrings
    else if (gherkinStep.docString) {
      argument = gherkinStep.docString.content;
    }

    return {
      keyword: gherkinStep.keyword.trim(),
      text: overrideText || gherkinStep.text,
      argument: argument,
    };
  }

  loadScenarioMetadata(scenarios: Scenario[]): ScenarioMetadata[] {
    return scenarios.map((scenario) => {
      const metadata: ScenarioMetadata = {
        scenarioName: scenario.name,
        tags: scenario.tags,
      };

      for (const tag of scenario.tags) {
        if (tag.startsWith("vus:")) {
          metadata.vus = parseInt(tag.split(":")[1]);
        } else if (tag.startsWith("duration:")) {
          metadata.duration = tag.split(":")[1];
        } else if (tag.startsWith("stages:")) {
          metadata.stages = tag.split(":")[1];
        } else if (tag.startsWith("threshold:")) {
          const split = tag.split(":")[1].split("=");
          if (split.length === 2) {
            metadata.thresholds = metadata.thresholds || {};
            metadata.thresholds[split[0]] = split[1];
          }
        } else if (tag.startsWith("group:")) {
          metadata.group = tag.split(":")[1];
        }
      }

      return metadata;
    });
  }
}
