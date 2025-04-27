import { DataTable } from "@cucumber/cucumber";

declare module "@cucumber/cucumber" {
  interface World {
    config: {
      method?: string;
      options?: any;
      headers?: Record<string, string>;
      endpoints?: string[];
      body?: any;
      endpoint?: string;
    };
  }
}

export function Given(
  pattern: string,
  fn: (
    this: import("@cucumber/cucumber").World,
    ...args: any[]
  ) => Promise<any> | void
): void;
export function When(
  pattern: string,
  fn: (
    this: import("@cucumber/cucumber").World,
    ...args: any[]
  ) => Promise<any> | void
): void;
export function Then(
  pattern: string,
  fn: (
    this: import("@cucumber/cucumber").World,
    ...args: any[]
  ) => Promise<any> | void
): void;

declare function Given(
  pattern: "I set a k6 script for {word} testing",
  implementation: (
    this: import("@cucumber/cucumber").World,
    method: string
  ) => void
): void;
declare function When(
  pattern: "I set to run the k6 script with the following configurations:",
  implementation: (
    this: import("@cucumber/cucumber").World,
    dataTable: DataTable
  ) => void
): void;
declare function When(
  pattern: "I set the request headers:",
  implementation: (
    this: import("@cucumber/cucumber").World,
    dataTable: DataTable
  ) => void
): void;
declare function When(
  pattern: "I set the following endpoint\\(s) used:",
  implementation: (
    this: import("@cucumber/cucumber").World,
    docString: string
  ) => void
): void;
declare function When(
  pattern: "I set the following {word} body is used for {string}",
  implementation: (
    this: import("@cucumber/cucumber").World,
    method: string,
    endpoint: string,
    docString: string
  ) => void
): void;
declare function When(
  pattern: "I set the authentication type is {string}",
  implementation: (
    this: import("@cucumber/cucumber").World,
    authType: string
  ) => void
): void;
declare function Then(
  pattern: "I see the API should handle the {word} request successfully",
  implementation: (
    this: import("@cucumber/cucumber").World,
    method: string,
    options?: { timeout?: number }
  ) => Promise<void>
): void;
