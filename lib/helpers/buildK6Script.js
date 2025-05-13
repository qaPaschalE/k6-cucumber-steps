module.exports = function buildK6Script(config) {
  const { method, endpoints, endpoint, body, headers, options } = config;

  // Ensure at least one of `endpoints` or `endpoint` is defined
  if (!endpoints?.length && !endpoint) {
    throw new Error(
      'Either "endpoints" or "endpoint" must be defined in the configuration.'
    );
  }

  // Prefer API_BASE_URL, fallback to BASE_URL
  const BASE_URL = process.env.API_BASE_URL || process.env.BASE_URL;
  if (!BASE_URL) {
    throw new Error(
      "Neither API_BASE_URL nor BASE_URL is defined in the environment variables."
    );
  }

  // Resolve relative endpoints by prepending BASE_URL
  const resolveEndpoint = (url) => {
    return url.startsWith("/") ? `${BASE_URL}${url}` : url;
  };

  return `
import http from 'k6/http';
import { check } from 'k6';

export const options = ${JSON.stringify(options, null, 2)};

export default function () {
  ${
    endpoints?.length
      ? endpoints
          .map(
            (url, i) => `
    const resolvedUrl${i} = "${resolveEndpoint(url)}";
    const res${i} = http.request("${method}", resolvedUrl${i}, ${
              method === "GET" || method === "DELETE"
                ? "null"
                : JSON.stringify(body)
            }, {
      headers: ${JSON.stringify(headers, null, 2)}
    });
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
            : JSON.stringify(body)
        }, {
      headers: ${JSON.stringify(headers, null, 2)}
    });
    console.log(\`Response Body for \${resolvedUrl}: \${res.body}\`);
    check(res, {
      "status is 2xx": (r) => r.status >= 200 && r.status < 300
    });
  `
  }
}
  `;
};
