/**
 * @module generateHeaders
 * @description
 * This module generates HTTP headers for API requests based on the specified authentication type.
 * It supports API key, bearer token, basic authentication, and no authentication.
 * Generates HTTP headers based on the specified authentication type.
 * Supported auth types: api_key, bearer_token, basic, none.
 */
module.exports = function generateHeaders(authType, env, aliases = {}) {
  const headers = { "Content-Type": "application/json" };

  const getValue = (key) => env[key] || aliases[key] || "";

  if (authType === "api_key") {
    headers["x-api-key"] = getValue("API_KEY");
  } else if (authType === "bearer_token") {
    headers["Authorization"] = `Bearer ${getValue("token")}`;
  } else if (authType === "basic") {
    const base64 = Buffer.from(
      `${getValue("BASIC_USER")}:${getValue("BASIC_PASS")}`
    ).toString("base64");
    headers["Authorization"] = `Basic ${base64}`;
  } else if (authType === "none") {
    // Do nothing extra
  } else if (aliases[authType]) {
    // Dynamic alias token support
    headers["Authorization"] = `Bearer ${getValue(authType)}`;
  } else {
    throw new Error(
      `Unsupported authentication type or missing alias: ${authType}`
    );
  }

  return headers;
};
