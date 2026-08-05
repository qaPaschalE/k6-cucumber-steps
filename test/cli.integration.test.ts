import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';

describe('CLI Integration Tests', () => {
  const testDir = join(__dirname, '..', 'test', 'integration-output');
  const featuresDir = join(testDir, 'features');
  const generatedDir = join(testDir, 'generated');
  const cliPath = join(__dirname, '..', 'dist', 'cli.js');

  beforeAll(() => {
    // Build the project first
    execSync('npm run build', { cwd: join(__dirname, '..'), stdio: 'ignore' });

    // Create test feature directory
    mkdirSync(featuresDir, { recursive: true });
    mkdirSync(generatedDir, { recursive: true });

    // Write a test feature file
    const featureContent = `
Feature: Integration Test

  Background:
    Given the k6 base URL is "{{API_BASE_URL}}"

  @smoke @vus:5 @duration:10s
  Scenario: Simple GET request
    When I k6 make a GET request to "/users/1"
    Then the k6 response status should be "200"
    And the k6 response should contain "name"

  @smoke
  Scenario: POST with body
    Given I k6 have the following post data:
      """
      {
        "title": "{{POST_TITLE}}",
        "body": "Test content",
        "userId": 1
      }
      """
    When I k6 make a POST request to "/posts"
    Then the k6 response status should be "201"
    And the k6 response property "title" should be "{{POST_TITLE}}"

  @browser @iterations:1
  Scenario: Browser navigation
    When I k6 navigate to the "/home" page
    Then I k6 should see the text "Welcome"
`;
    writeFileSync(join(featuresDir, 'integration.feature'), featureContent);
  });

  afterAll(() => {
    // Clean up
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true });
    }
  });

  it('generates k6 script from feature files', () => {
    const result = execSync(`node "${cliPath}" generate -f "${featuresDir}" -o "${generatedDir}" -l ts`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Found 1 feature file(s)');
    expect(result).toContain('Total scenarios found: 3');
    expect(result).toContain('Generated k6 script:');
    expect(result).toContain('Scenarios processed: 3');
  });

  it('generates valid TypeScript that can be parsed', () => {
    const scriptPath = join(generatedDir, 'test.generated.ts');
    expect(existsSync(scriptPath)).toBe(true);

    const script = readFileSync(scriptPath, 'utf8');

    // Check essential parts exist
    expect(script).toContain('export default async function ()');
    expect(script).toContain('export const options =');
    expect(script).toContain('export function teardown');
    expect(script).toContain('export function handleSummary');
    expect(script).toContain('import http from "k6/http"');
    expect(script).toContain('import { check, sleep, group } from "k6"');
    expect(script).toContain('import * as steps from "../steps/index.ts"');

    // Check browser import for @browser scenario
    expect(script).toContain('import { browser } from "k6/browser"');

    // Check scenario steps
    expect(script).toContain('steps.theK6BaseUrlIs("{{API_BASE_URL}}")');
    expect(script).toContain('steps.iK6MakeAGetRequestTo("/users/1")');
    expect(script).toContain('steps.theK6ResponseStatusShouldBe("200")');
    expect(script).toContain('steps.theK6ResponseShouldContain("name")');

    expect(script).toContain('steps.iK6HaveTheFollowingPostData');
    expect(script).toContain('steps.iK6MakeAPostRequestTo("/posts")');
    expect(script).toContain('steps.theK6ResponseStatusShouldBe("201")');
    expect(script).toContain('steps.theK6ResponsePropertyShouldBe("title", "{{POST_TITLE}}")');

    // Check browser steps
    expect(script).toContain('await steps.iK6NavigateToThePage(page, "/home")');
    expect(script).toContain('await steps.iK6ShouldSeeTheText(page, "Welcome")');
  });

  it('respects tag filtering --tags', () => {
    const result = execSync(`node "${cliPath}" generate -f "${featuresDir}" -o "${generatedDir}" -l ts --tags smoke`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Including scenarios with tags: smoke');
    expect(result).toContain('Scenarios processed: 2'); // Only the two @smoke scenarios
  });

  it('respects tag filtering --exclude-tags', () => {
    const result = execSync(`node "${cliPath}" generate -f "${featuresDir}" -o "${generatedDir}" -l ts --exclude-tags browser`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    expect(result).toContain('Excluding scenarios with tags: browser');
    expect(result).toContain('Scenarios processed: 2'); // Excludes the @browser scenario
  });

  it('supports multiple feature paths', () => {
    // Create a second feature file in a subdirectory
    const subDir = join(featuresDir, 'api');
    mkdirSync(subDir, { recursive: true });
    writeFileSync(join(subDir, 'extra.feature'), `
Feature: Extra Feature

  Scenario: Another test
    When I k6 make a GET request to "/test"
    Then the k6 response status should be "200"
`);

    const result = execSync(`node "${cliPath}" generate -f "${featuresDir},${subDir}" -o "${generatedDir}" -l ts`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    // The parser finds integration.feature + extra.feature + simple.feature from fixtures
    expect(result).toContain('Found 3 feature file(s)');
    expect(result).toContain('Scenarios processed: 5'); // 3 + 2 (integration + extra) + 2 (from fixture)
  });
});

function writeFileSync(path: string, content: string) {
  require('fs').writeFileSync(path, content);
}