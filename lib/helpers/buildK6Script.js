module.exports = function buildK6Script(config) {
  const { method, endpoints, endpoint, body, headers, options } = config;

  if (!endpoints?.length && !endpoint) {
    throw new Error(
      'Either "endpoints" or "endpoint" must be defined in the configuration.'
    );
  }

  const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL;
  if (!BASE_URL) {
    throw new Error(
      "Neither API_BASE_URL nor BASE_URL is defined in the environment variables."
    );
  }

  const resolveEndpoint = (url) => {
    return url.startsWith("/") ? `${BASE_URL}${url}` : url;
  };

  const stringifiedHeaders = JSON.stringify(headers, null, 2);
  const stringifiedBody = JSON.stringify(body, null, 2);

  return `
import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

export const options = ${JSON.stringify(options, null, 2)};

export default function () {
  const headers = ${stringifiedHeaders};
  const body = ${stringifiedBody};

  ${
    endpoints?.length
      ? endpoints
          .map(
            (url, i) => `
  const resolvedUrl${i} = "${resolveEndpoint(url)}";
  const res${i} = http.request("${method}", resolvedUrl${i}, ${
              method === "GET" || method === "DELETE"
                ? "null"
                : "JSON.stringify(body)"
            }, { headers });
  console.log(\`Response Body for \${resolvedUrl${i}}: \${res${i}.body}\`);
  check(res${i}, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300
  });
  `
          )
          .join("\n")
      : `
  const resolvedUrl = "${resolveEndpoint(endpoint)}";
  const res = http.request("${method}", resolvedUrl, ${
          method === "GET" || method === "DELETE"
            ? "null"
            : "JSON.stringify(body)"
        }, { headers });
  console.log(\`Response Body for \${resolvedUrl}: \${res.body}\`);
  check(res, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300
  });
  `
  }
}

export function handleSummary(data) {
  const outputDir = __ENV.REPORT_OUTPUT_DIR || "reports";
  const html = htmlReport(data);
  const cucumberReportFile = "cucumber-report.html";
  const cucumberLink = \`
    <div style="text-align:center; margin-top:20px;">
      <a href="\${cucumberReportFile}" style="font-size:18px; color:#0066cc;">
        🔗 View Cucumber Test Report
      </a>
    </div>
  \`;

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const k6ReportFilename = \`\${outputDir}/k6-report-\${timestamp}.html\`;

  console.log(\`📄 K6 HTML report \${k6ReportFilename} generated successfully 👍\`);

  return {
    [k6ReportFilename]: html.replace("</body>", \`\${cucumberLink}</body>\`),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}
`;
};
