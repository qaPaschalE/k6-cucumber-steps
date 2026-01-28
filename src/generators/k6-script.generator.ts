import { Scenario, ScenarioMetadata, ProjectConfig } from "../types";

export class K6ScriptGenerator {
  generateK6File(
    scenarios: Scenario[],
    metadata: ScenarioMetadata[],
    config: ProjectConfig,
  ): string {
    const header = `
/**
 * Generated k6 test script
 */
globalThis.savedTokens = {};
globalThis.lastResponse = {};
`;

    const imports = this.generateImports(config, metadata);
    const options = this.generateOptions(metadata);
    const testFunction = this.generateTestFunction(scenarios, metadata);

    return `
${header}
${imports}

${options}

export function setup() {
  // We must return an object here to initialize the "data" channel
  return { v: Date.now() };
}

${testFunction}

export function teardown(tokensFromDefault) {
  // Capture return value from default function
  globalThis.exportedTokens = tokensFromDefault;
}
export function handleSummary(data) {
  const reports = {
    './reports/summary.html': htmlReport(data),
    './reports/results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };

  console.log('--- Summary File Write Audit ---');
  
  // Try to find tokens in teardown_data (the return value of default function)
  let tokens = data.teardown_data || globalThis.exportedTokens || globalThis.savedTokens || {};
  
  // If k6 nested it due to the async/await structure
  if (data.setup_data && !Object.keys(tokens).length) {
      tokens = data.setup_data;
  }

  const keys = Object.keys(tokens).filter(k => k.endsWith('.json'));
  console.log('Tokens found:', keys.length > 0 ? keys.join(', ') : 'None');

  for (const [path, tokenValue] of Object.entries(tokens)) {
    if (path.endsWith('.json')) {
      const fullPath = path.startsWith('./') ? path : \`./\${path}\`;
      reports[fullPath] = JSON.stringify(typeof tokenValue === 'string' ? { access_token: tokenValue } : tokenValue, null, 2);
      console.log(\`✅ Writing: \${fullPath}\`);
    }
  }

  return reports;
}`;
  }

  private generateImports(
    config: ProjectConfig,
    metadata: ScenarioMetadata[],
  ): string {
    const ext = config.language === "ts" ? "ts" : "js";
    const hasBrowser = metadata.some((m) => m.tags?.includes("browser"));

    const baseImports = [
      'import http from "k6/http";',
      'import { check, sleep, group } from "k6";',
      'import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";',
      'import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";',
    ];

    if (hasBrowser) {
      baseImports.push('import { browser } from "k6/browser";');
    }

    baseImports.push(`import * as steps from "../steps/sample.steps.${ext}";`);

    return baseImports.join("\n");
  }

  private generateOptions(metadata: ScenarioMetadata[]): string {
    let vus = 1;
    let duration = "30s";
    let stages: any[] = [];
    let thresholds: Record<string, any> = {};
    const hasBrowser = metadata.some((m) => m.tags?.includes("browser"));

    for (const meta of metadata) {
      if (meta.vus) vus = Math.max(vus, meta.vus);
      if (meta.duration) duration = meta.duration;
      if (meta.thresholds) Object.assign(thresholds, meta.thresholds);

      if (meta.stages) {
        stages = meta.stages.split(",").map((s) => {
          const [d, t] = s.split("-");
          return { duration: d, target: parseInt(t) };
        });
      }
    }

    const formattedThresholds: Record<string, any> = {};
    for (const [key, value] of Object.entries(thresholds)) {
      if (this.isValidK6Metric(key)) {
        formattedThresholds[key] = [value];
      }
    }

    // Build the k6 options object
    const k6Options: any = {};

    if (stages.length > 0) {
      k6Options.stages = stages;
    } else {
      k6Options.vus = vus;
      k6Options.duration = duration;
    }

    if (Object.keys(formattedThresholds).length > 0) {
      k6Options.thresholds = formattedThresholds;
    }

    if (hasBrowser) {
      k6Options.scenarios = {
        default: {
          executor: "shared-iterations",
          options: {
            browser: {
              type: "chromium",
            },
          },
        },
      };
    }

    return `export const options = ${JSON.stringify(k6Options, null, 2)};`;
  }

  private isValidK6Metric(metricName: string): boolean {
    const validMetrics = [
      "http_req_duration",
      "http_req_failed",
      "http_req_connecting",
      "http_req_tls_handshaking",
      "http_req_waiting",
      "http_req_receiving",
      "data_sent",
      "data_received",
      "iteration_duration",
      "iterations",
      "vus",
      "vus_max",
      "browser_web_vital_lcp",
      "browser_web_vital_fid",
      "browser_web_vital_cls",
    ];
    return (
      validMetrics.includes(metricName) || /^[a-z][a-z0-9_]*$/.test(metricName)
    );
  }

  private normalizeStepText(text: string): string {
    // 1. Remove quotes and their contents
    const noQuotes = text.replace(/"[^"]*"|'[^']*'/g, "").trim();

    // 2. Remove non-alphanumeric characters (except spaces)
    const cleanChars = noQuotes.replace(/[^a-zA-Z0-9\s]/g, "");

    // 3. Split by whitespace and camelCase
    // Using a simpler split regex to avoid double-backslash issues in TS templates
    return cleanChars
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("");
  }

  private extractArguments(text: string): string {
    const stringMatches = text.match(/"([^"]*)"|'([^']*)'/g) || [];
    const intMatches = text.match(/\b\d+\b/g) || [];
    return [...stringMatches, ...intMatches].join(", ");
  }

  private generateTestFunction(
    scenarios: Scenario[],
    metadata: ScenarioMetadata[],
  ): string {
    const allStepCalls = scenarios
      .map((scenario) => {
        const isBrowser = scenario.tags?.includes("browser");
        const stepLines = [
          `  group(${JSON.stringify(scenario.name)}, function () {`,
        ];

        if (isBrowser) {
          // Safety initialization
          stepLines.push(`    let context, page;`);
          stepLines.push(`    try {`);
          stepLines.push(`      context = browser.newContext();`);
          stepLines.push(
            `      if (!context) throw new Error("Browser Context could not be created.");`,
          );
          stepLines.push(`      page = context.newPage();`);
          stepLines.push(`      (async () => {`);
          stepLines.push(`        try {`);
        }

        scenario.steps.forEach((step) => {
          const name = this.normalizeStepText(step.text);
          const args = this.extractArguments(step.text);
          const callParams = [];

          if (isBrowser) callParams.push("page");
          if (args && args.trim().length > 0) callParams.push(args);
          if (step.argument) {
            callParams.push(JSON.stringify(step.argument));
          }

          const awaitPrefix = isBrowser ? "await " : "";
          const indent = isBrowser ? "          " : "    ";
          stepLines.push(
            `${indent}${awaitPrefix}steps.${name}(${callParams.join(", ")});`,
          );
        });

        if (isBrowser) {
          stepLines.push(`        } catch (err) {`);
          stepLines.push(
            `          console.error('Step Execution Error: ' + err.message);`,
          );
          stepLines.push(`        } finally {`);
          stepLines.push(`          if (page) page.close();`);
          stepLines.push(`          if (context) context.close();`);
          stepLines.push(`        }`);
          // Close the async arrow function and the IIFE call
          stepLines.push(`      })();`);
          stepLines.push(`    } catch (e) {`);
          stepLines.push(
            `      console.error('Browser Initialization Failed: ' + e.message);`,
          );
          stepLines.push(`    }`);
        }

        stepLines.push(`    sleep(1);`);
        stepLines.push(`  });`);

        return stepLines.join("\n");
      })
      .join("\n\n");

    // The outer try/finally ensures globalThis.savedTokens is ALWAYS returned
    // even if a group crashes.
    return `export default function () {
  try {
${allStepCalls}
  } finally {
    return globalThis.savedTokens;
  }
}`;
  }
}
