/**
 * @module generateHeaders
 * @description
 * This module generates HTTP headers for API requests based on the specified authentication type.
 * It supports API key, bearer token, and basic authentication.
 * Generates HTTP headers based on the specified authentication type.
 * Supported auth types: api_key, bearer_token, basic.
 * @param {string} authType - The type of authentication to use.
 * @param {object} env - The environment variables object.
 * @returns {object} - The generated headers object.
 * @throws {Error} - If the authentication type is unsupported.
 * @example
 * const headers = generateHeaders('api_key', process.env);
 * // headers will contain the API key in the x-api-key header.
 * @example
 * const headers = generateHeaders('bearer_token', process.env);
 * // headers will contain the bearer token in the Authorization header.
 * @example
 * const headers = generateHeaders('basic', process.env);
 * // headers will contain the basic auth credentials in the Authorization header.
 * @example
 * const headers = generateHeaders('none', process.env);
 * // headers will contain only the Content-Type header.
 * @example
 * const headers = generateHeaders('invalid_auth_type', process.env);
 * // throws an error: Unsupported authentication type: invalid_auth_type
 */

module.exports = function buildK6Script(config) {
  const { method, endpoints, endpoint, body, headers, options } = config;

  // Ensure at least one of `endpoints` or `endpoint` is defined
  if (!endpoints?.length && !endpoint) {
    throw new Error(
      'Either "endpoints" or "endpoint" must be defined in the configuration.'
    );
  }

  // Get BASE_URL from environment variables
  const BASE_URL = process.env.BASE_URL;
  if (!BASE_URL) {
    throw new Error("BASE_URL is not defined in the environment variables.");
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
\    const res = http.request("${method}", resolvedUrl, ${
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
