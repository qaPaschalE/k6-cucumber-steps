// src/generators/k6-script.generator.ts
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
globalThis.savedTokens = globalThis.savedTokens || {};
globalThis.lastResponse = globalThis.lastResponse || {};
`;

    const imports = this.generateImports(config, metadata);
    const options = this.generateOptions(metadata);
    const testFunction = this.generateTestFunction(scenarios, metadata, config);

    // ✅ Simplified teardown: just return the tokens (no globalThis needed)
    const teardownFn = config.language === "ts"
      ? `export function teardown(tokensFromDefault: Record<string, any>) {
  return tokensFromDefault;
}`
      : `export function teardown(tokensFromDefault) {
  return tokensFromDefault;
}`;

    // ✅ handleSummary already uses data.teardown_data — no change needed
    const handleSummaryFn = config.language === "ts"
      ? `export function handleSummary(data: any): Record<string, any> {
  const reports: Record<string, any> = {
    './reports/summary.html': htmlReport(data),
    './reports/results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };

  console.log('--- Summary File Write Audit ---');
  
  const tokens = data.teardown_data || {};
  const keys = Object.keys(tokens).filter(k => k.endsWith('.json'));
  console.log('Tokens found:', keys.length > 0 ? keys.join(', ') : 'None');

  for (const [path, tokenValue] of Object.entries(tokens)) {
    if (path.endsWith('.json')) {
      const fullPath = path.startsWith('./') ? path : \`./\${path}\`;
      reports[fullPath] = JSON.stringify(
        typeof tokenValue === 'string' ? { access_token: tokenValue } : tokenValue,
        null,
        2
      );
      console.log(\`✅ Writing: \${fullPath}\`);
    }
  }

  return reports;
}`
      : `export function handleSummary(data) {
  const reports = {
    './reports/summary.html': htmlReport(data),
    './reports/results.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };

  console.log('--- Summary File Write Audit ---');
  
  const tokens = data["root_group::teardown"] || {};
  const keys = Object.keys(tokens).filter(k => k.endsWith('.json'));
  console.log('Tokens found:', keys.length > 0 ? keys.join(', ') : 'None');

  for (const [path, tokenValue] of Object.entries(tokens)) {
    if (path.endsWith('.json')) {
      // ✅ Use path directly — no ./ prefix
      reports[path] = JSON.stringify(
        typeof tokenValue === 'string' ? { access_token: tokenValue } : tokenValue,
        null,
        2
      );
      console.log(\`✅ Writing: \${path}\`);
    }
  }

  return reports;
}`;

    return `
${header}
${imports}

${options}

export function setup() {
  return { v: Date.now() };
}

${testFunction}

${teardownFn}

${handleSummaryFn}
`;
  }

  private generateImports(config: ProjectConfig, meta: ScenarioMetadata[]): string {
    const ext = config.language === "ts" ? "ts" : "js";
    const hasBrowser = meta.some(m => m.tags?.includes("browser")); // ← now used!

    const baseImports = [
      'import http from "k6/http";',
      'import { check, sleep, group } from "k6";',
    ];

    // Add @ts-ignore for remote modules in TS mode
    if (config.language === "ts") {
      baseImports.push('// @ts-ignore: k6 resolves remote modules at runtime');
      baseImports.push('import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";');
      baseImports.push('// @ts-ignore: k6 resolves remote modules at runtime');
      baseImports.push('import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";');
    } else {
      baseImports.push('import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";');
      baseImports.push('import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";');
    }

    if (hasBrowser) {
      baseImports.push('import { browser } from "k6/browser";');
    }

    baseImports.push(`import * as steps from "../steps/sample.steps.${ext}";`);

    return baseImports.join("\n");
  }

  private generateOptions(metadata: ScenarioMetadata[]): string {
    let vus = 1;
    let duration = "30s";
    let iterations: number | null = null;
    let stages: any[] = [];
    let thresholds: Record<string, any> = {};
    const hasBrowser = metadata.some((m) => m.tags?.includes("browser"));

    // 1. Parse Metadata
    for (const meta of metadata) {
      if (meta.vus) vus = Math.max(vus, meta.vus);
      if (meta.duration) duration = meta.duration;
      if (meta.thresholds) Object.assign(thresholds, meta.thresholds);
      const iterTag = meta.tags?.find(t => t.startsWith("iterations:"));
      if (iterTag) {
        iterations = parseInt(iterTag.split(":")[1]);
      }
      if (meta.stages) {
        stages = meta.stages.split(",").map((s) => {
          const [d, t] = s.split("-");
          return { duration: d.trim(), target: parseInt(t.trim()) };
        });
      }
    }

    // 2. Prepare k6Options object
    const k6Options: any = {};

    // 3. Add Thresholds (Always allowed at top level)
    const formattedThresholds: Record<string, any> = {};
    for (const [key, value] of Object.entries(thresholds)) {
      if (this.isValidK6Metric(key)) {
        formattedThresholds[key] = [value];
      }
    }
    if (Object.keys(formattedThresholds).length > 0) {
      k6Options.thresholds = formattedThresholds;
    }

    if (hasBrowser) {
      // Determine the executor
      const executor = iterations ? "shared-iterations" : (stages.length > 0 ? "ramping-vus" : "constant-vus");

      const scenario: any = {
        executor: executor,
      };

      // Apply workload based on executor type
      if (executor === "shared-iterations") {
        scenario.vus = vus;
        scenario.iterations = iterations;
      } else if (executor === "ramping-vus") {
        scenario.stages = stages;
        scenario.startVUs = vus;
      } else {
        // constant-vus
        scenario.vus = vus;
        scenario.duration = duration;
      }

      // Add browser options
      scenario.options = {
        browser: {
          type: "chromium",
        },
      };

      k6Options.scenarios = {
        default: scenario
      };

    } else {
      // Protocol-based logic
      if (iterations) {
        k6Options.scenarios = {
          default: {
            executor: "shared-iterations",
            vus: vus,
            iterations: iterations,
          }
        };
      } else {
        if (stages.length > 0) {
          k6Options.stages = stages;
        } else {
          k6Options.vus = vus;
          k6Options.duration = duration;
        }
      }
    }

    return `export const options = ${JSON.stringify(k6Options, null, 2)
      };`;
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
    // Remove quoted strings first
    const noQuotes = text.replace(/"[^"]*"|'[^']*'/g, "");
    // Normalize "with headers" -> treat as separate keyword
    let clean = noQuotes
      .replace(/\s+with\s+headers\s*$/, "") // remove trailing "with headers"
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .trim();

    const words = clean.split(/\s+/).filter(w => w);
    
    // Check if the step starts with "k6" or contains "k6" as a keyword
    // If text contains "k6", move it to the front
    const k6Index = words.findIndex(w => w.toLowerCase() === 'k6');
    if (k6Index > 0) {
      // Remove 'k6' from its position and put it at the front
      const k6Word = words.splice(k6Index, 1)[0];
      words.unshift(k6Word);
    }
    
    return words.map((w, i) =>
      i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join("");
  }

  private extractArguments(text: string): string {
    // Only extract quoted strings (double or single quotes)
    const matches = text.match(/"([^"]*)"|'([^']*)'/g) || [];
    // Return the quoted literals as-is (e.g., '"hello"', "'1'")
    return matches.join(", ");
  }

  // Inside K6ScriptGenerator.ts

  private generateTestFunction(scenarios: Scenario[], metadata: ScenarioMetadata[], config: ProjectConfig): string {
    const hasAnyBrowser = metadata.some((m) => m.tags?.includes("browser"));
    const lines: string[] = [];

    // Open browser if any scenario uses it
    if (hasAnyBrowser) {
      lines.push(`let page;`);
      lines.push(`try {`);
      lines.push(`  page = await browser.newPage();`);
      lines.push(`  console.log('Browser page opened once for all scenarios');`);
      // Set fallback base URL only if needed
      lines.push(`  steps.k6TheBaseUrlIs("https://demoqa.com");`);
      lines.push(`  console.log('Fallback baseUrl set to:', globalThis.baseUrl || 'not set');`);
      lines.push(``);
    }

    // Process ALL scenarios (both browser and HTTP)
    scenarios.forEach((scenario) => {
      const isBrowser = scenario.tags?.includes("browser");

      // Init group
      lines.push(`  group(${JSON.stringify(scenario.name + " - init")}, () => {`);
      lines.push(`    console.log('Initiating scenario: ${scenario.name}');`);
      lines.push(`  });`);

      if (isBrowser) {
        lines.push(`  try {`);
        scenario.steps.forEach((step) => {
          const name = this.normalizeStepText(step.text);
          const argsStr = this.extractArguments(step.text);
          const args = argsStr ? argsStr.split(/,\s*/).filter(Boolean) : [];

          const needsPage = [
            "navigate", "click", "see", "fill", "type", "press", "waitfor", "wait", "locator",
            "select", "title", "url", "element", "shouldsee", "shouldnotsee", "button", "find"
          ].some(kw => name.toLowerCase().includes(kw)) &&
            !["thebaseurlis", "thebaseurl"].some(kw => name.toLowerCase().includes(kw));

          const params: string[] = [];
          if (needsPage) {
            params.push("page");
          }
          params.push(...args);
          if (step.argument && typeof step.argument === 'string') {
            params.push(JSON.stringify(step.argument));
          }

          const callPrefix = needsPage || params.length > 1 ? 'await ' : '';
          lines.push(`    ${callPrefix}steps.${name}(${params.join(", ")});`);
        });
        lines.push(`  } catch (err) {`);
        const stackAccessCode = config.language === "ts"
          ? "(err as any)?.stack || 'No stack'"
          : "err?.stack || 'No stack'";

        lines.push(`      console.error('Error in ${scenario.name}:', err);`);
        lines.push(`      console.error('Stack:', ${stackAccessCode});`);
        lines.push(`    }`);
      } else {
        // Non-browser (HTTP/API) steps
        scenario.steps.forEach((step) => {
          const name = this.normalizeStepText(step.text);
          const argsStr = this.extractArguments(step.text);
          const args = argsStr ? argsStr.split(/,\s*/).filter(Boolean) : [];

          const params: string[] = [];
          params.push(...args);
          if (step.argument && typeof step.argument === 'string') {
            params.push(JSON.stringify(step.argument));
          }
          if (step.argument && Array.isArray(step.argument)) {
            params.push(JSON.stringify(step.argument));
          }

          lines.push(`  steps.${name}(${params.join(", ")});`);
        });
      }

      // Cleanup group
      lines.push(`  group(${JSON.stringify(scenario.name + " - cleanup")}, () => {`);
      lines.push(`    console.log('Finished: ${scenario.name}');`);
      lines.push(`  });`);
      lines.push(`  sleep(1);`);
      lines.push(``);
    });

    // Close browser if opened
    if (hasAnyBrowser) {
      lines.push(`} finally {`);
      lines.push(`  if (page) {`);
      lines.push(`    try { await page.close(); await sleep(0.5); } catch (e) { console.warn('Final page close failed:', e); }`);
      lines.push(`  }`);
      lines.push(`}`);
    }

    return `
export default async function () {
${lines.join("\n")}
console.log('🔍 Final savedTokens:', JSON.stringify(globalThis.savedTokens));

  return globalThis.savedTokens || {};
}`;
  }
}