// src/generators/samples/sample-steps.generator.ts
import fs from "fs";
import path from "path";
import { ProjectConfig } from "../../types";
import { StepsMetadataGenerator } from "./steps-metadata.generator";

export class SampleStepsGenerator {
  generate(outputPath: string, config: ProjectConfig): void {
    const isTS = config.language === "ts";
    const stepExtension = isTS ? ".ts" : ".js";

    const sampleSteps = this.buildSampleStepsContent(isTS);

    fs.writeFileSync(
      path.join(outputPath, "steps", `sample.steps${stepExtension}`),
      sampleSteps,
    );

    // Generate metadata.json for step autocomplete
    const metadataGenerator = new StepsMetadataGenerator();
    metadataGenerator.generate(outputPath);
  }

  private buildSampleStepsContent(isTS: boolean): string {
    return `import http from "k6/http";
import { check, sleep, group } from "k6";

let baseUrl = "";
let defaultHeaders = {
  'Content-Type': 'application/json'
} as Record<string, string>;

// Replace {{VARIABLE_NAME}} placeholders with environment values
// k6 uses __ENV global object instead of process.env
function replaceEnvVariables(text: string): string {
  return text.replace(/\\{\\{([^}]+)\\}\\}/g, (match, key) => {
    const value = (globalThis as any)[key] || (__ENV as any)[key] || (__ENV as any)[\`K6_\${key.toUpperCase()}\`];
    if (value === undefined) {
      console.warn(\`⚠️ Environment variable "\${key}" not found, using literal value\`);
      return match;
    }
    return value;
  });
}

/* ===== HTTP / API STEPS ===== */

/**
 * Loads request body from a payload.json file.
 * Supports {{VARIABLE_NAME}} for env vars and {{alias:NAME}} for stored aliases.
 */
export function k6IUsePayloadJsonFromFile(fileName: string) {
  const fs = require('fs');
  const path = require('path');

  // Resolve path relative to current working directory or data folder
  let filePath = fileName;
  if (!path.isAbsolute(fileName)) {
    // Try data/ folder first, then root
    if (fs.existsSync(path.join(process.cwd(), 'data', fileName))) {
      filePath = path.join(process.cwd(), 'data', fileName);
    } else if (fs.existsSync(path.join(process.cwd(), fileName))) {
      filePath = path.join(process.cwd(), fileName);
    } else {
      filePath = path.join(process.cwd(), 'payload.json');
    }
  }

  if (!fs.existsSync(filePath)) {
    console.error(\`❌ Payload file not found: \${filePath}\`);
    return;
  }

  let payloadContent = fs.readFileSync(filePath, 'utf8');

  // Replace environment variables {{VARIABLE_NAME}}
  payloadContent = replaceEnvVariables(payloadContent);

  // Replace alias references {{alias:NAME}}
  payloadContent = replaceAliasVariables(payloadContent);

  globalThis.lastPostData = payloadContent;
  console.log(\`📄 Loaded payload from: \${filePath}\`);
}

/**
 * Helper: Replace {{alias:NAME}} with stored alias values
 */
function replaceAliasVariables(text: string): string {
  return text.replace(/\{\{alias:([^}]+)\}\}/g, (match, aliasName) => {
    const value = globalThis.storedAliases?.[aliasName];
    if (value === undefined) {
      console.warn(\`⚠️ Alias "\${aliasName}" not found, using literal value\`);
      return match;
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  });
}

export function k6TheBaseUrlIs(url: string) {
  baseUrl = replaceEnvVariables(url.trim());
  console.log(\`📍 Base URL set to: \${baseUrl}\`);
}

export function k6IAuthenticateWithTheFollowingUrlAndRequestBodyAsWith(
  context: string,
  formatOrTable: any,
  maybeTable: any
) {
  let format = 'json';
  let dataTable;

  if (maybeTable === undefined) {
    format = 'json';
    dataTable = formatOrTable;
  } else {
    format = formatOrTable;
    dataTable = maybeTable;
  }

  if (!dataTable || !dataTable[0]) return;

  const row = dataTable[0];
  const { endpoint, ...payload } = row;
  const url = \`\${baseUrl}\${endpoint}\`;

  let body: any;
  let params = {
    headers: {} as Record<string, string>
  };
  if (format === 'form') {
    params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = Object.assign({}, payload);
  } else {
    params.headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = http.post(url, body, params);

  const success = check(response, {
    [\`Auth successful (\${format})\`]: (r) => r.status === 200 || r.status === 201
  });

  if (success) {
    globalThis.lastResponse = response;
    try {
      const parsed = response.json();
      let keys: string[] = [];
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        keys = Object.keys(parsed);
      }
      console.log(\`✅ \${context} Response Captured. Keys: \${keys.join(', ')}\`);
    } catch (e) {
      console.error(\`❌ Failed to parse JSON response for \${context}: \${response.body}\`);
      globalThis.lastResponse = null;
    }
  } else {
    console.error(\`❌ Auth failed for \${context}. Status: \${response.status}\`);
    globalThis.lastResponse = null;
  }
}

export function k6IAuthenticateWithTheFollowingUrlAndRequestBodyAs(
  context: string,
  formatOrTable: any,
  maybeTable?: any
) {
  let format = 'json';
  let dataTable;

  if (maybeTable === undefined) {
    dataTable = formatOrTable;
  } else {
    format = formatOrTable;
    dataTable = maybeTable;
  }

  if (!dataTable || !dataTable[0]) return;

  const row = dataTable[0];
  const { endpoint, ...payload } = row;
  const url = \`\${baseUrl}\${endpoint}\`;

  let body: any;
  let params = {
    headers: {} as Record<string, string>
  };

  if (format === 'form') {
    params.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = Object.assign({}, payload);
  } else {
    params.headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }

  const response = http.post(url, body, params);

  const success = check(response, {
    [\`Auth successful(\${format})\`]: (r) => r.status === 200 || r.status === 201
  });

  if (success) {
    globalThis.lastResponse = response;
    try {
      const parsed = response.json();
      let keys: string[] = [];
      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        keys = Object.keys(parsed);
      }
      console.log(\`✅ \${context} Response Captured. Keys: \${keys.join(', ')}\`);
    } catch (e) {
      console.error(\`❌ Failed to parse JSON response for \${context}: \${response.body}\`);
      globalThis.lastResponse = null;
    }
  } else {
    console.error(\`❌ Auth failed for \${context}. Status: \${response.status}\`);
    globalThis.lastResponse = null;
  }
}

export function k6IStoreIn(jsonPath: any, fileName: any) {
  const responseData = globalThis.lastResponse;

  if (!responseData) {
    console.error('❌ No response data to store. Did an HTTP request run?');
    return;
  }

  let parsedBody;
  try {
    if (typeof responseData.json === 'function') {
      parsedBody = responseData.json();
    } else {
      parsedBody = responseData;
    }
  } catch (e: any) {
    console.error('❌ Failed to parse response as JSON:', e.message || e);
    return;
  }

  const value = jsonPath.split('.').reduce((acc: any, key: any) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, parsedBody);

  if (value === undefined) {
    console.error(\`❌ Path "\${jsonPath}" not found in response. Available keys:\`, Object.keys(parsedBody).join(', '));
    return;
  }

  const alias = fileName.split(/[\\\\/]/).pop()?.replace(/\\.json$/, '') || fileName;
  
  globalThis.storedAliases = globalThis.storedAliases || {};
  globalThis.storedAliases[alias] = value;
  globalThis.storedAliases[fileName] = value;
  
  globalThis.savedTokens = globalThis.savedTokens || {};
  globalThis.savedTokens[alias] = value;
  globalThis.savedTokens[fileName] = value;

  console.log(\`✅ Stored response "\${jsonPath}" as alias "\${alias}"\`);
  console.log(\`   File path: \${fileName}\`);
  console.log(\`   Value: \${typeof value === 'string' && value.length > 20 ? value.substring(0, 20) + '...' : JSON.stringify(value)}\`);
  console.log(\`   Aliases available: \${alias}, \${fileName}\`);
}

/**
 * And I k6 write "aliasName" to "data/file.json"
 * Writes an alias value to a JSON file. Creates the file if it doesn't exist.
 */
export function k6IWriteTo(aliasName: string, fileName: string) {
  const fs = require('fs');
  const path = require('path');
  
  // Get the alias value
  const value = globalThis.storedAliases?.[aliasName];
  
  if (value === undefined) {
    console.error(\`❌ Alias "\${aliasName}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    return;
  }
  
  // Resolve file path
  let filePath = fileName;
  if (!path.isAbsolute(fileName)) {
    filePath = path.join(process.cwd(), fileName);
  }
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(\`📁 Created directory: \${dir}\`);
  }
  
  // Prepare data to write
  let dataToWrite;
  
  // If value is already an object/array, use it directly
  if (typeof value === 'object') {
    dataToWrite = value;
  } else {
    // If it's a primitive, wrap it in an object with the alias name as key
    dataToWrite = {
      [aliasName]: value,
      writtenAt: new Date().toISOString()
    };
  }
  
  // Write to file
  fs.writeFileSync(filePath, JSON.stringify(dataToWrite, null, 2));
  console.log(\`✅ Wrote alias "\${aliasName}" to \${filePath}\`);
  console.log(\`   Value: \${typeof value === 'string' && value.length > 20 ? value.substring(0, 20) + '...' : JSON.stringify(value)}\`);
}

/**
 * And I k6 write "aliasName" to "data/file.json" as "customKey"
 * Writes an alias value to a JSON file with a custom key name.
 */
export function k6IWriteToAs(aliasName: string, fileName: string, customKey: string) {
  const fs = require('fs');
  const path = require('path');
  
  // Get the alias value
  const value = globalThis.storedAliases?.[aliasName];
  
  if (value === undefined) {
    console.error(\`❌ Alias "\${aliasName}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    return;
  }
  
  // Resolve file path
  let filePath = fileName;
  if (!path.isAbsolute(fileName)) {
    filePath = path.join(process.cwd(), fileName);
  }
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(\`📁 Created directory: \${dir}\`);
  }
  
  // Prepare data with custom key
  const dataToWrite = {
    [customKey]: value,
    writtenAt: new Date().toISOString()
  };
  
  // Write to file
  fs.writeFileSync(filePath, JSON.stringify(dataToWrite, null, 2));
  console.log(\`✅ Wrote alias "\${aliasName}" as "\${customKey}" to \${filePath}\`);
  console.log(\`   Value: \${typeof value === 'string' && value.length > 20 ? value.substring(0, 20) + '...' : JSON.stringify(value)}\`);
}

export function k6IAmAuthenticatedAsA(userType: any) {
  const token = globalThis.savedTokens?.[\`data/\${userType}.json\`] ||
    globalThis.savedTokens?.[userType];

  if (token) {
    defaultHeaders['Authorization'] = \`Bearer \${token}\`;
    console.log(\`🔑 Using token for \${userType}\`);
  } else {
    console.warn(\`⚠️ No token found for \${userType}\`);
  }
}

export function k6ISetTheDefaultHeaders(data: any) {
  if (data && data.length > 0) {
    Object.assign(defaultHeaders, data[0]);
  }
}

export function k6IMakeAGetRequestTo(endpoint: any) {
  return k6IMakeAGetRequestToWithHeaders(endpoint, []);
}

export function k6IMakeAGetRequestToWithHeaders(endpoint: any, headersTable: any) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  let requestHeaders = { ...defaultHeaders };
  if (headersTable?.length > 0) {
    Object.assign(requestHeaders, headersTable[0]);
  }
  const res = http.get(url, { headers: requestHeaders });
  check(res, {
    'headers sent correctly': (r) => {
      const sent = r.request.headers;
      return Object.keys(requestHeaders).every(k => {
        const s = sent[k];
        const e = requestHeaders[k];
        return Array.isArray(s) ? s.includes(e) : s === e;
      });
    }
  });
  globalThis.lastResponse = res;
}

export function k6TheResponseStatusShouldBe(expectedStatus: any) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  const status = parseInt(expectedStatus, 10);
  check(res, {
    [\`status is \${expectedStatus}\`]: (r) => r.status === status
  });
}

export function k6TheResponseShouldContain(field: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    check(res, {
      [\`response contains "\${field}"\`]: () => body[field] !== undefined
    });
  } catch (e: any) {
    check(res, {
      [\`response contains "\${field}"\`]: () => false
    });
  }
}

export function k6TheResponsePropertyShouldNotBeEmpty(propertyPath: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    const value = getPropertyByPath(body, propertyPath);
    const isEmpty = value === undefined || value === null || value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0);
    check(res, {
      [\`response property "\${propertyPath}" is not empty\`]: () => !isEmpty
    });
    if (!isEmpty) {
      console.log(\`✅ Response property "\${propertyPath}" has value\`);
    } else {
      console.error(\`❌ Response property "\${propertyPath}" is empty\`);
    }
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${propertyPath}" is not empty\`]: () => false
    });
    console.error('Error checking property:', e.message);
  }
}

export function k6TheResponsePropertyShouldBeTrue(propertyPath: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    const value = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" is true\`]: () => value === true || value === 'true'
    });
    if (value === true || value === 'true') {
      console.log(\`✅ Response property "\${propertyPath}" is true\`);
    } else {
      console.error(\`❌ Response property "\${propertyPath}" is not true (got: \${value})\`);
    }
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${propertyPath}" is true\`]: () => false
    });
    console.error('Error checking property:', e.message);
  }
}

export function k6TheResponsePropertyShouldBeFalse(propertyPath: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    const value = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" is false\`]: () => value === false || value === 'false'
    });
    if (value === false || value === 'false') {
      console.log(\`✅ Response property "\${propertyPath}" is false\`);
    } else {
      console.error(\`❌ Response property "\${propertyPath}" is not false (got: \${value})\`);
    }
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${propertyPath}" is false\`]: () => false
    });
    console.error('Error checking property:', e.message);
  }
}

export function k6IHaveTheFollowingPostData(data: string) {
  globalThis.lastPostData = replaceEnvVariables(data);
  console.log('📝 Post data stored with environment variables replaced');
}

export function k6IMakeAPostRequestTo(endpoint: string) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  const payload = globalThis.lastPostData ? replaceEnvVariables(globalThis.lastPostData) : '{}';
  const response = http.post(url, payload, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

/**
 * Makes a POST request using a payload.json file.
 * Supports {{VARIABLE_NAME}} for env vars and {{alias:NAME}} for stored aliases.
 */
export function k6IMakeAPostRequestToWithPayloadFile(endpoint: string, fileName: string) {
  const fs = require('fs');
  const path = require('path');

  // Resolve payload file path
  let filePath = fileName;
  if (!path.isAbsolute(fileName)) {
    if (fs.existsSync(path.join(process.cwd(), 'data', fileName))) {
      filePath = path.join(process.cwd(), 'data', fileName);
    } else if (fs.existsSync(path.join(process.cwd(), fileName))) {
      filePath = path.join(process.cwd(), fileName);
    } else {
      filePath = path.join(process.cwd(), 'payload.json');
    }
  }

  if (!fs.existsSync(filePath)) {
    console.error(\`❌ Payload file not found: \${filePath}\`);
    return;
  }

  let payloadContent = fs.readFileSync(filePath, 'utf8');
  payloadContent = replaceEnvVariables(payloadContent);
  payloadContent = replaceAliasVariables(payloadContent);

  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  const response = http.post(url, payloadContent, { headers: defaultHeaders });
  globalThis.lastResponse = response;
  console.log(\`📤 POST \${url} with payload from \${filePath}\`);
}

export function k6IMakeAPostRequestToWithBody(endpoint: string, bodyData: any) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  let payload = '{}';

  if (typeof bodyData === 'string') {
    payload = replaceEnvVariables(bodyData);
  } else if (Array.isArray(bodyData) && bodyData.length > 0) {
    payload = replaceEnvVariables(JSON.stringify(bodyData[0]));
  }

  const response = http.post(url, payload, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

export function k6IMakeAPutRequestTo(endpoint: string) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  const payload = globalThis.lastPostData ? replaceEnvVariables(globalThis.lastPostData) : '{}';
  const response = http.put(url, payload, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

export function k6IMakeAPutRequestToWithBody(endpoint: string, bodyData: any) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  let payload = '{}';

  if (typeof bodyData === 'string') {
    payload = replaceEnvVariables(bodyData);
  } else if (Array.isArray(bodyData) && bodyData.length > 0) {
    payload = replaceEnvVariables(JSON.stringify(bodyData[0]));
  }

  const response = http.put(url, payload, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

export function k6IMakeAPatchRequestTo(endpoint: string) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  const payload = globalThis.lastPostData ? replaceEnvVariables(globalThis.lastPostData) : '{}';
  const response = http.patch(url, payload, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

export function k6IMakeAPatchRequestToWithBody(endpoint: string, bodyData: any) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  let payload = '{}';

  if (typeof bodyData === 'string') {
    payload = replaceEnvVariables(bodyData);
  } else if (Array.isArray(bodyData) && bodyData.length > 0) {
    payload = replaceEnvVariables(JSON.stringify(bodyData[0]));
  }

  const response = http.patch(url, payload, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

/**
 * Makes a DELETE request to the specified endpoint.
 * Supports {{VARIABLE_NAME}} for env vars in endpoint.
 */
export function k6IMakeADeleteRequestTo(endpoint: string) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  const response = http.del(url, null, { headers: defaultHeaders });
  globalThis.lastResponse = response;
}

/**
 * Makes a DELETE request with custom headers.
 * Supports {{VARIABLE_NAME}} for env vars in endpoint.
 */
export function k6IMakeADeleteRequestToWithHeaders(endpoint: string, headersTable: any) {
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  let requestHeaders = { ...defaultHeaders };
  if (headersTable?.length > 0) {
    Object.assign(requestHeaders, headersTable[0]);
  }
  const response = http.del(url, null, { headers: requestHeaders });
  globalThis.lastResponse = response;
}

/**
 * Makes a DELETE request using a payload.json file.
 * Supports {{VARIABLE_NAME}} for env vars and {{alias:NAME}} for stored aliases.
 */
export function k6IMakeADeleteRequestToWithPayloadFile(endpoint: string, fileName: string) {
  const fs = require('fs');
  const path = require('path');
  
  // Resolve payload file path
  let filePath = fileName;
  if (!path.isAbsolute(fileName)) {
    if (fs.existsSync(path.join(process.cwd(), 'data', fileName))) {
      filePath = path.join(process.cwd(), 'data', fileName);
    } else if (fs.existsSync(path.join(process.cwd(), fileName))) {
      filePath = path.join(process.cwd(), fileName);
    } else {
      filePath = path.join(process.cwd(), 'payload.json');
    }
  }
  
  if (!fs.existsSync(filePath)) {
    console.error(\`❌ Payload file not found: \${filePath}\`);
    return;
  }
  
  let payloadContent = fs.readFileSync(filePath, 'utf8');
  payloadContent = replaceEnvVariables(payloadContent);
  payloadContent = replaceAliasVariables(payloadContent);
  
  const resolvedEndpoint = replaceEnvVariables(endpoint);
  const url = \`\${baseUrl}\${resolvedEndpoint}\`;
  const response = http.del(url, payloadContent, { headers: defaultHeaders });
  globalThis.lastResponse = response;
  console.log(\`🗑️ DELETE \${url} with payload from \${filePath}\`);
}

export function k6TheResponsePropertyShouldBe(propertyPath: string, expectedValue: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    const actualValue = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" is "\${expectedValue}"\`]: () => String(actualValue) === expectedValue
    });
  } catch (e: any) {
    check(res, {
      [\`response property "\${propertyPath}" is "\${expectedValue}"\`]: () => false
    });
  }
}

export function k6TheResponsePropertyShouldHaveProperty(parentPath: string, childProperty: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    const parentValue = getPropertyByPath(body, parentPath);
    
    if (parentValue === undefined || parentValue === null) {
      console.error(\`❌ Parent property "\${parentPath}" not found or null\`);
      check(res, {
        [\`response property "\${parentPath}" has property "\${childProperty}"\`]: () => false
      });
      return;
    }
    
    if (typeof parentValue !== 'object') {
      console.error(\`❌ Parent property "\${parentPath}" is not an object\`);
      check(res, {
        [\`response property "\${parentPath}" has property "\${childProperty}"\`]: () => false
      });
      return;
    }
    
    const hasProperty = childProperty in parentValue;
    check(res, {
      [\`response property "\${parentPath}" has property "\${childProperty}"\`]: () => hasProperty
    });
    
    if (hasProperty) {
      console.log(\`✅ Response property "\${parentPath}" has property "\${childProperty}"\`);
    } else {
      console.error(\`❌ Response property "\${parentPath}" does not have property "\${childProperty}". Available keys:\`, Object.keys(parentValue).join(', '));
    }
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${parentPath}" has property "\${childProperty}"\`]: () => false
    });
    console.error('Error checking property:', e.message);
  }
}

export function k6TheResponsePropertyShouldContain(propertyPath: string, expectedText: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  try {
    const body = res.json();
    const actualValue = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" contains "\${expectedText}"\`]: () => String(actualValue).includes(expectedText)
    });
  } catch (e: any) {
    check(res, {
      [\`response property "\${propertyPath}" contains "\${expectedText}"\`]: () => false
    });
  }
}

export function k6TheResponseTimeShouldBeLessThanMilliseconds(milliseconds: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  const maxMs = parseInt(milliseconds, 10);
  const actualMs = res.timings?.duration || res.timings?.end - res.timings?.start || 0;
  check(res, {
    [\`response time is less than \${milliseconds}ms\`]: () => actualMs < maxMs
  });
  if (actualMs < maxMs) {
    console.log(\`✅ Response time: \${actualMs}ms (< \${maxMs}ms)\`);
  } else {
    console.error(\`❌ Response time: \${actualMs}ms (>= \${maxMs}ms threshold)\`);
  }
}

export function k6TheResponseTimeShouldBeLessThanSeconds(seconds: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }
  const maxSeconds = parseInt(seconds, 10);
  const maxMs = maxSeconds * 1000;
  const actualMs = res.timings?.duration || res.timings?.end - res.timings?.start || 0;
  check(res, {
    [\`response time is less than \${seconds}s\`]: () => actualMs < maxMs
  });
  if (actualMs < maxMs) {
    console.log(\`✅ Response time: \${actualMs}ms (< \${maxSeconds}s)\`);
  } else {
    console.error(\`❌ Response time: \${actualMs}ms (>= \${maxSeconds}s threshold)\`);
  }
}

function getPropertyByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc: any, key: string) => {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
}

export function k6IClearAuthToken() {
  delete defaultHeaders['Authorization'];
  console.log('🔑 Cleared Authorization header');
}

export function k6IStoreResponseAs(propertyPath: string, alias: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found! Cannot store response.');
    return;
  }
  try {
    const body = res.json();
    const value = getPropertyByPath(body, propertyPath);

    if (value === undefined) {
      console.error(\`❌ Path "\${propertyPath}" not found in response. Available keys:\`, Object.keys(body));
      return;
    }

    if (!globalThis.storedAliases) {
      globalThis.storedAliases = {};
    }
    globalThis.storedAliases[alias] = value;

    const displayValue = typeof value === 'string' && value.length > 20
      ? value.substring(0, 20) + '...'
      : value;

    console.log(\`✅ Stored response "\${propertyPath}" as "\${alias}": \${JSON.stringify(displayValue)}\`);
  } catch (err) {
    const e = err as Error;
    console.error('❌ Failed to parse response as JSON:', e.message || e);
  }
}

export function k6IStoreResponseDataAs(propertyPath: string, alias: string) {
  return k6IStoreResponseAs(propertyPath, alias);
}

export function k6TheResponsePropertyShouldBeAlias(propertyPath: string, alias: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }

  const storedValue = globalThis.storedAliases?.[alias];
  if (storedValue === undefined) {
    console.error(\`❌ Alias "\${alias}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    return;
  }

  try {
    const body = res.json();
    const actualValue = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" matches alias "\${alias}"\`]: () => String(actualValue) === String(storedValue)
    });
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${propertyPath}" matches alias "\${alias}"\`]: () => false
    });
    console.error('Error parsing response:', e.message);
  }
}

export function k6TheResponsePropertyShouldContainAlias(propertyPath: string, alias: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }

  const storedValue = globalThis.storedAliases?.[alias];
  if (storedValue === undefined) {
    console.error(\`❌ Alias "\${alias}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    return;
  }

  try {
    const body = res.json();
    const actualValue = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" contains alias "\${alias}"\`]: () => String(actualValue).includes(String(storedValue))
    });
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${propertyPath}" contains alias "\${alias}"\`]: () => false
    });
    console.error('Error parsing response:', e.message);
  }
}

export function k6TheResponsePropertyShouldNotBeAlias(propertyPath: string, alias: string) {
  const res = globalThis.lastResponse;
  if (!res) {
    console.error('❌ No lastResponse found!');
    return;
  }

  const storedValue = globalThis.storedAliases?.[alias];
  if (storedValue === undefined) {
    console.error(\`❌ Alias "\${alias}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    return;
  }

  try {
    const body = res.json();
    const actualValue = getPropertyByPath(body, propertyPath);
    check(res, {
      [\`response property "\${propertyPath}" does not match alias "\${alias}"\`]: () => String(actualValue) !== String(storedValue)
    });
  } catch (err) {
    const e = err as Error;
    check(res, {
      [\`response property "\${propertyPath}" does not match alias "\${alias}"\`]: () => false
    });
    console.error('Error parsing response:', e.message);
  }
}

export function k6TheAliasShouldNotBeEmpty(alias: string) {
  const storedValue = globalThis.storedAliases?.[alias];

  if (storedValue === undefined) {
    console.error(\`❌ Alias "\${alias}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    check({ value: null }, {
      [\`alias "\${alias}" exists and is not empty\`]: () => false
    });
    return;
  }

  const isEmpty = storedValue === null || storedValue === undefined || storedValue === '' ||
    (Array.isArray(storedValue) && storedValue.length === 0) ||
    (typeof storedValue === 'object' && Object.keys(storedValue).length === 0);

  check({ value: storedValue }, {
    [\`alias "\${alias}" is not empty\`]: () => !isEmpty
  });

  if (!isEmpty) {
    console.log(\`✅ Alias "\${alias}" has value: \${typeof storedValue === 'string' && storedValue.length > 20 ? storedValue.substring(0, 20) + '...' : storedValue}\`);
  }
}

export function k6TheAliasShouldBeEqualTo(alias: string, expectedValue: string) {
  const storedValue = globalThis.storedAliases?.[alias];

  if (storedValue === undefined) {
    console.error(\`❌ Alias "\${alias}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    check({ value: null }, {
      [\`alias "\${alias}" equals "\${expectedValue}"\`]: () => false
    });
    return;
  }

  check({ value: storedValue }, {
    [\`alias "\${alias}" equals "\${expectedValue}"\`]: () => String(storedValue) === expectedValue
  });
}

export function k6IPrintAlias(alias: string) {
  const storedValue = globalThis.storedAliases?.[alias];

  if (storedValue === undefined) {
    console.error(\`❌ Alias "\${alias}" not found. Available aliases:\`, globalThis.storedAliases ? Object.keys(globalThis.storedAliases) : 'none');
    return;
  }

  console.log(\`📋 Alias "\${alias}" = \${JSON.stringify(storedValue, null, 2)}\`);
}

export function k6IPrintAllAliases() {
  if (!globalThis.storedAliases) {
    console.log('📋 No aliases stored yet.');
    return;
  }

  const aliases = globalThis.storedAliases;
  const keys = Object.keys(aliases);

  if (keys.length === 0) {
    console.log('📋 No aliases stored yet.');
    return;
  }

  console.log('📋 Stored Aliases:');
  keys.forEach(key => {
    const value = aliases[key];
    const displayValue = typeof value === 'string' && value.length > 50
      ? value.substring(0, 50) + '...'
      : JSON.stringify(value);
    console.log(\`   \${key} = \${displayValue}\`);
  });
}

/* ===== BROWSER STEPS ===== */

export async function k6INavigateToThePage(page: any, url: string) {
  let effectiveBase = baseUrl;
  if (typeof effectiveBase !== 'string' || effectiveBase.trim() === '') {
    console.warn('Invalid baseUrl detected:', baseUrl, '— using fallback');
    effectiveBase = 'https://test.k6.io';
  }
  const fullUrl = url.startsWith('http') ? url : \`\${effectiveBase}\${url.startsWith('/') ? '' : '/'}\${url}\`;
  console.log(\`Navigating to: \${fullUrl} (base: \${effectiveBase})\`);
  await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
}

export async function k6IClickTheButton(page: any, selector: string) {
  await page.locator(selector).click();
}

export async function k6IShouldSeeTheText(page: any, expectedText: string) {
  let locator = page.getByRole('heading', { name: expectedText, exact: false });
  if ((await locator.count()) === 0) {
    locator = page.getByText(expectedText, { exact: false }).first();
  }

  try {
    await locator.waitFor({ state: 'visible', timeout: 30000 });
    const count = await locator.count();
    console.log(\`Found \${count} visible elements matching "\${expectedText}"\`);
    check(locator, {
      [\`Text/heading containing "\${expectedText}" is visible\`]: () => count >= 1
    });
  } catch (e: any) {
    console.error(\`Text wait failed for "\${expectedText}":\`, e.message || e);
    check(locator, {
      [\`Text/heading containing "\${expectedText}" is visible\`]: () => false
    });
  }
}

export async function k6IClickOnTheElement(page: any, selector: string, nth?: any) {
  const locator = nth
    ? page.locator(selector).nth(parseInt(nth) - 1)
    : page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.click();
  console.log(\`✅ Clicked element: \${selector}\`);
}

export async function k6IFillTheFieldWith(
  page: any,
  selector: string,
  value: string,
  nth?: any
) {
  const locator = nth
    ? page.locator(selector).nth(parseInt(nth) - 1)
    : page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.fill(value);
  console.log(\`✅ Filled field \${selector} with "\${value}"\`);
}

export async function k6IFill(page: any, value: string) {
  await page.keyboard.type(value);
  console.log(\`✅ Filled value: "\${value}" (using keyboard)\`);
}

export async function k6ThePageTitleShouldBe(page: any, expectedTitle: string) {
  await page.waitForLoadState('networkidle');
  const title = await page.title();
  check(title, {
    [\`Page title is "\${expectedTitle}"\`]: (t) => t === expectedTitle
  });
}

export async function k6TheCurrentUrlShouldContain(page: any, expectedFragment: string) {
  const url = page.url();
  check(url, {
    [\`URL contains "\${expectedFragment}"\`]: (u) => u.includes(expectedFragment)
  });
}

export async function k6IShouldSeeTheElement(page: any, selector: string) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const isVisible = await locator.isVisible();
  if (!isVisible) throw new Error(\`Element not visible: \${selector}\`);
  console.log(\`✅ Verified visibility of element: \${selector}\`);
}

export async function k6IShouldNotSeeTheText(page: any, text: string) {
  const locator = page.getByText(text, { exact: false });
  const isHidden = (await locator.count()) === 0 || !(await locator.isVisible());
  check(isHidden, {
    [\`Text "\${text}" is not visible\`]: (hidden) => hidden === true
  });
}

export async function k6ISelectFromTheDropdown(page: any, option: string, selector: string) {
  const locator = page.locator(selector);
  await locator.selectOption(option);
  console.log(\`Selected "\${option}" from dropdown "\${selector}"\`);
}

export async function k6IWaitForTheElementToBeVisible(page: any, selector: string) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 30000 });
}

export async function k6IGetElementBySelector(page: any, selector: string) {
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  console.log(\`Found element by selector: \${selector}\`);
  return locator;
}

export async function k6IFindElementByLabel(page: any, labelText: string) {
  const locator = page.getByLabel(labelText, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  console.log(\`Found element by label: "\${labelText}"\`);
  return locator;
}

export async function k6IFindElementByTextarea(page: any, placeholderOrLabel: string) {
  let locator = page.getByPlaceholder(placeholderOrLabel, { exact: false });

  if ((await locator.count()) === 0) {
    locator = page.getByLabel(placeholderOrLabel, { exact: false })
      .or(page.getByRole('textbox', { name: placeholderOrLabel }));
  }

  await locator.waitFor({ state: 'visible', timeout: 15000 });
  console.log(\`Found textarea by placeholder / label: "\${placeholderOrLabel}"\`);
  return locator;
}

export async function k6IClick(page: any) {
  try {
    const bbox = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || !el.getBoundingClientRect) return null;
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    });

    if (!bbox || bbox.width === 0 || bbox.height === 0) {
      console.warn('No clickable focused element found');
      return;
    }

    const x = bbox.x + bbox.width / 2;
    const y = bbox.y + bbox.height / 2;
    await page.mouse.click(x, y);
    console.log('✅ Performed mouse click on focused element');
  } catch (error: any) {
    console.error('Click failed on focused element:', error.message || error);
    throw error;
  }
}

export async function k6IWaitSeconds(page: any, secondsStr: string) {
  const seconds = parseFloat(secondsStr);
  if (isNaN(seconds) || seconds < 0) {
    throw new Error(\`Invalid wait time: "\${secondsStr}"\`);
  }
  await sleep(seconds);
}

export async function k6IWaitMilliseconds(page: any, milliseconds: string) {
  const timeInMs = parseFloat(milliseconds);
  if (isNaN(timeInMs) || timeInMs < 0) {
    throw new Error(\`Invalid wait time: "\${milliseconds}" milliseconds\`);
  }
  console.log(\`Waiting for \${milliseconds} ms\`);
  await page.waitForTimeout(timeInMs);
}

export async function k6IFindInputElementByPlaceholderText(page: any, placeholder: string) {
  const locator = page.getByPlaceholder(placeholder, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} input(s) with placeholder "\${placeholder}"\`);
  return locator;
}

export async function k6IFindElementByText(page: any, text: string) {
  const locator = page.getByText(text, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} element(s) containing text "\${text}"\`);
  return locator;
}

export async function k6IFindElementsByText(page: any, text: string) {
  const locator = page.getByText(text, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} elements containing text "\${text}"\`);
  return locator;
}

export async function k6IFindButtonByText(page: any, buttonText: string) {
  const locator = page.getByText(buttonText, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} element(s) containing text "\${buttonText}"\`);
  return locator;
}

export async function k6IFindElementByValue(page: any, valueText: string) {
  const locator = page.locator(\`input[value="\${valueText}"], textarea[value="\${valueText}"]\`);
  try {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const count = await locator.count();

    if (count === 0) {
      console.warn(\`No element found with value attribute "\${valueText}"\`);
    }

    console.log(\`Found \${count} element(s) with value attribute "\${valueText}"\`);

    if (count > 0) {
      const tags = await locator.evaluateAll((els: Element[]) =>
        els.map((el: Element) => el.tagName.toLowerCase())
      );
      console.log(\`Matching elements are: \${tags.join(', ')}\`);
    }

    return locator;
  } catch (error: any) {
    console.error(\`Could not find element by value "\${valueText}":\`, error.message || error);
    check(locator, {
      [\`Element with value "\${valueText}" is found\`]: () => false
    });
    throw error;
  }
}

export async function k6IFindElementByRole(page: any, roleName: string, nameOrOptions?: string | object) {
  let locator;

  if (!nameOrOptions) {
    locator = page.getByRole(roleName);
  } else if (typeof nameOrOptions === 'string') {
    locator = page.getByRole(roleName, { name: nameOrOptions, exact: false });
  } else {
    locator = page.getByRole(roleName, nameOrOptions);
  }

  try {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const count = await locator.count();
    console.log(\`Found \${count} element(s) by role "\${roleName}"\`);

    if (typeof nameOrOptions === 'string') {
      console.log(\`  with name containing "\${nameOrOptions}"\`);
    }

    return locator;
  } catch (error: any) {
    console.error(\`Could not find element by role "\${roleName}":\`, error.message || error);
    check(locator, {
      [\`Element by role "\${roleName}" is found\`]: () => false
    });
    throw error;
  }
}

export async function k6IFindButtonsByText(page: any, buttonText: string) {
  const locator = page.getByRole('button', { name: buttonText, exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  const count = await locator.count();
  console.log(\`Found \${count} button(s) with text "\${buttonText}"\`);
  return locator;
}

export async function k6IFindElementByName(page: any, labelText: string) {
  const locator = page.getByLabel(labelText, { exact: false });
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  console.log(\`Found input by label: "\${labelText}"\`);
  return locator;
}

export async function k6IFindElementById(page: any, id: string) {
  const selector = id.startsWith('#') ? id : \`#\${id}\`;
  const locator = page.locator(selector);
  await locator.waitFor({ state: 'visible', timeout: 20000 });
  console.log(\`Found element by ID: \${selector}\`);
  return locator;
}

export async function k6IClickOnExactText(page: any, text: string) {
  const locator = page.getByText(text, { exact: true });

  try {
    await locator.waitFor({ state: 'visible', timeout: 20000 });
    const count = await locator.count();
    if (count === 0) {
      throw new Error(\`No element found with exact text: "\${text}"\`);
    }
    if (count > 1) {
      console.warn(\`⚠️ Multiple (\${count}) elements found with exact text "\${text}". Clicking the first.\`);
    }

    await locator.first().click();
    console.log(\`✅ Clicked element with exact text: "\${text}"\`);
  } catch (error: any) {
    console.error(\`Failed to click exact text "\${text}":\`, error.message || error);
    throw error;
  }
}

export async function k6IFillNthFieldBySelector(page: any, n: string, selector: string, value: string) {
  const index = parseInt(n.replace(/\\D/g, '')) - 1;
  if (isNaN(index)) throw new Error(\`Invalid nth value: \${n}\`);

  const locator = page.locator(selector).nth(index);
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  await locator.fill(value);
  console.log(\`Filled the \${n} element matching "\${selector}" with "\${value}"\`);
}
`;
  }
}
