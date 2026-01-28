import fs from "fs";
import path from "path";
import * as Gherkin from "@cucumber/gherkin";
import * as Messages from "@cucumber/messages";
import { FeatureFile, Scenario, Step, ScenarioMetadata } from "../types";

export class FeatureParser {
  async loadAndParseFeatures(featuresPath: string): Promise<FeatureFile[]> {
    // Resolve path relative to the Current Working Directory
    const resolvedPath = path.resolve(process.cwd(), featuresPath);
    const featureFiles: FeatureFile[] = [];

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `The path "${featuresPath}" does not exist at ${resolvedPath}`,
      );
    }

    if (fs.statSync(resolvedPath).isDirectory()) {
      const files = fs.readdirSync(resolvedPath);
      for (const file of files) {
        if (file.endsWith(".feature")) {
          const fullPath = path.join(resolvedPath, file);
          const content = fs.readFileSync(fullPath, "utf8");
          featureFiles.push(this.parseFeature(content, fullPath));
        }
      }
    } else {
      const content = fs.readFileSync(resolvedPath, "utf8");
      featureFiles.push(this.parseFeature(content, resolvedPath));
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
