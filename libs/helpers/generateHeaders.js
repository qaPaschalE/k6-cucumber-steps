/**
 * @module generateHeaders
 * @description
 * This module generates HTTP headers for API requests based on the specified authentication type.
 * It supports API key, bearer token, and basic authentication.
 * Generates HTTP headers based on the specified authentication type.
 * Supported auth types: api_key, bearer_token, basic.
 */
module.exports = function generateHeaders(authType, env) {
  const headers = { "Content-Type": "application/json" };

  if (authType === "api_key") {
    headers["x-api-key"] = env.API_KEY || "";
  } else if (authType === "bearer_token") {
    headers["Authorization"] = `Bearer ${env.BEARER_TOKEN || ""}`;
  } else if (authType === "basic") {
    const base64 = Buffer.from(`${env.BASIC_USER}:${env.BASIC_PASS}`).toString(
      "base64"
    );
    headers["Authorization"] = `Basic ${base64}`;
  } else {
    throw new Error(`Unsupported authentication type: ${authType}`);
  }

  return headers;
};
