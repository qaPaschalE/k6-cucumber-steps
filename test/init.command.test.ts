import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, rmSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Init Command Tests', () => {
  const testDir = join(__dirname, '..', 'test', 'init-output');
  const testDirPrefix = join(__dirname, '..', 'test', 'init-output-prefix');
  const cliPath = join(__dirname, '..', 'dist', 'cli.js');

  beforeAll(() => {
    // Build the project first
    execSync('npm run build', { cwd: join(__dirname, '..'), stdio: 'ignore' });
  });

  afterAll(() => {
    // Clean up
    if (existsSync(testDir)) rmSync(testDir, { recursive: true, force: true });
    if (existsSync(testDirPrefix)) rmSync(testDirPrefix, { recursive: true, force: true });
  });

  it('initializes project without a prefix by default', () => {
    // Run init without prefix
    execSync(`node "${cliPath}" init "${testDir}"`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    const metadataPath = join(testDir, 'steps', 'metadata.json');
    const stepsPath = join(testDir, 'steps', 'sample.steps.ts');
    
    expect(existsSync(metadataPath)).toBe(true);
    expect(existsSync(stepsPath)).toBe(true);

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    const stepsContent = readFileSync(stepsPath, 'utf8');

    // Default is no prefix, so we expect 'the base URL is'
    const baseUrlStep = metadata.find((s: any) => s.pattern.includes('base URL is {string}'));
    expect(baseUrlStep).toBeDefined();
    expect(baseUrlStep.pattern).toBe('the base URL is {string}');
    expect(baseUrlStep.functionName).toBe('theBaseUrlIs');

    // And check sample.steps.ts
    expect(stepsContent).toContain('export function theBaseUrlIs');

    // Check newly generated files
    expect(existsSync(join(testDir, 'k6-cucumber.json'))).toBe(true);
    expect(existsSync(join(testDir, 'steps', 'hooks.ts'))).toBe(true);
    
    // Verify steps/index.ts exports hooks
    const indexContent = readFileSync(join(testDir, 'steps', 'index.ts'), 'utf8');
    expect(indexContent).toContain("export * from './hooks'");
  });

  it('initializes project with a custom prefix', () => {
    // Run init with a prefix
    execSync(`node "${cliPath}" init "${testDirPrefix}" --add-prefix "load test"`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });

    const metadataPath = join(testDirPrefix, 'steps', 'metadata.json');
    const stepsPath = join(testDirPrefix, 'steps', 'sample.steps.ts');
    
    expect(existsSync(metadataPath)).toBe(true);
    expect(existsSync(stepsPath)).toBe(true);

    const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));
    const stepsContent = readFileSync(stepsPath, 'utf8');

    // Custom prefix "load test"
    const baseUrlStep = metadata.find((s: any) => s.pattern.includes('base URL is {string}'));
    expect(baseUrlStep).toBeDefined();
    expect(baseUrlStep.pattern).toBe('the load test base URL is {string}');
    expect(baseUrlStep.functionName).toBe('loadTestTheBaseUrlIs');

    // And check sample.steps.ts
    expect(stepsContent).toContain('export function loadTestTheBaseUrlIs');
  });

  it('initializes project with CI/CD pipeline', () => {
    const ciDir = join(__dirname, '.test-ci');
    if (existsSync(ciDir)) {
      rmSync(ciDir, { recursive: true, force: true });
    }
    
    execSync(`node "${cliPath}" init "${ciDir}" --ci github`, {
      encoding: 'utf8',
      cwd: join(__dirname, '..'),
    });
    
    expect(existsSync(join(ciDir, '.github', 'workflows', 'k6.yml'))).toBe(true);
    const ciContent = readFileSync(join(ciDir, '.github', 'workflows', 'k6.yml'), 'utf8');
    expect(ciContent).toContain('name: k6-cucumber Load Test');
    
    rmSync(ciDir, { recursive: true, force: true });
  });
});
