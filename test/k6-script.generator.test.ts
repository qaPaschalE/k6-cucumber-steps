import { describe, it, expect, beforeEach } from 'vitest';
import { K6ScriptGenerator } from '../src/generators/k6-script.generator';
import { Scenario, ScenarioMetadata, ProjectConfig } from '../src/types';

describe('K6ScriptGenerator', () => {
  let generator: K6ScriptGenerator;

  beforeEach(() => {
    generator = new K6ScriptGenerator();
  });

  describe('normalizeStepText', () => {
    const normalize = (text: string) => {
      // Access private method via bracket notation
      return (generator as any).normalizeStepText(text);
    };

    it('removes quoted strings and normalizes (keyword already stripped by parser)', () => {
      // The Gherkin parser provides step.text WITHOUT the keyword
      expect(normalize('the k6 base URL is "https://example.com"')).toBe('k6TheBaseUrlIs');
      expect(normalize('I k6 make a GET request to "/users/1"')).toBe('k6IMakeAGetRequestTo');
      expect(normalize('the k6 response status should be "200"')).toBe('k6TheResponseStatusShouldBe');
    });

    it('handles unquoted numbers (Scenario Outline expansion)', () => {
      // After placeholder expansion, status codes become unquoted numbers
      expect(normalize('the k6 response status should be 200')).toBe('k6TheResponseStatusShouldBe200');
      // Note: This produces k6TheResponseStatusShouldBe200 but exported fn is k6TheResponseStatusShouldBe
      // This is a known gap - outline rows with numeric expectedStatus will fail
    });

    it('moves k6 to front if not first', () => {
      expect(normalize('I k6 make a GET request to "/users/1"')).toBe('k6IMakeAGetRequestTo');
      expect(normalize('I k6 click on the element "button"')).toBe('k6IClickOnTheElement');
    });

    it('strips "with headers" suffix', () => {
      expect(normalize('I k6 make a GET request to "/users/1" with headers:')).toBe('k6IMakeAGetRequestTo');
    });

    it('handles multiple quoted args', () => {
      expect(normalize('I k6 fill the field "#input-field" with "First" "1"')).toBe('k6IFillTheFieldWith');
    });
  });

  describe('extractArguments', () => {
    const extract = (text: string) => {
      return (generator as any).extractArguments(text);
    };

    it('extracts single quoted arg', () => {
      expect(extract('When I k6 make a GET request to "/users/1"')).toEqual(['"/users/1"']);
    });

    it('extracts multiple quoted args', () => {
      expect(extract('And I k6 fill the field "#firstName" with "Paschal"')).toEqual(['"#firstName"', '"Paschal"']);
      expect(extract('And I k6 fill the field "#input-field" with "First" "1"')).toEqual(['"#input-field"', '"First"', '"1"']);
    });

    it('handles no args', () => {
      expect(extract('And I k6 click')).toEqual([]);
    });
  });

  describe('generateK6File', () => {
    const config: ProjectConfig = {
      language: 'ts',
      featuresDir: './features',
      outputDir: './generated',
      includeHtmlReporter: true,
      author: 'Test Author',
      version: '1.0.0',
    };

    it('generates valid k6 script for HTTP scenarios', () => {
      const scenarios: Scenario[] = [
        {
          name: 'Simple GET',
          steps: [
            { keyword: 'Given', text: 'the k6 base URL is "https://api.example.com"' },
            { keyword: 'When', text: 'I k6 make a GET request to "/users/1"' },
            { keyword: 'Then', text: 'the k6 response status should be "200"' },
          ],
          tags: ['smoke', 'vus:5', 'duration:10s'],
        },
      ];

      // The metadata should match what FeatureParser.loadScenarioMetadata produces
      const metadata: ScenarioMetadata[] = [
        { scenarioName: 'Simple GET', tags: ['smoke', 'vus:5', 'duration:10s'], vus: 5, duration: '10s' },
      ];

      const script = generator.generateK6File(scenarios, metadata, config);

      expect(script).toContain('export default async function ()');
      expect(script).toContain('steps.k6TheBaseUrlIs("https://api.example.com")');
      expect(script).toContain('steps.k6IMakeAGetRequestTo("/users/1")');
      expect(script).toContain('steps.k6TheResponseStatusShouldBe("200")');
      expect(script).toContain('export const options =');
      expect(script).toContain('"vus": 5');
      expect(script).toContain('"duration": "10s"');
    });

    it('generates browser test setup when @browser tag present', () => {
      const scenarios: Scenario[] = [
        {
          name: 'UI Test',
          steps: [
            { keyword: 'When', text: 'I k6 navigate to the "/home" page' },
            { keyword: 'Then', text: 'I k6 should see the text "Welcome"' },
          ],
          tags: ['browser', 'iterations:1'],
        },
      ];

      const metadata: ScenarioMetadata[] = [
        { scenarioName: 'UI Test', tags: ['browser', 'iterations:1'] },
      ];

      const script = generator.generateK6File(scenarios, metadata, config);

      expect(script).toContain('import { browser } from "k6/browser"');
      expect(script).toContain('let page;');
      expect(script).toContain('page = await browser.newPage()');
      expect(script).toContain('await steps.k6INavigateToThePage(page, "/home")');
      expect(script).toContain('await steps.k6IShouldSeeTheText(page, "Welcome")');
      expect(script).toContain('"executor": "shared-iterations"');
      expect(script).toContain('"iterations": 1');
    });

    it('includes teardown and handleSummary', () => {
      const scenarios: Scenario[] = [
        { name: 'Test', steps: [{ keyword: 'When', text: 'I k6 make a GET request to "/"' }], tags: [] },
      ];
      const metadata: ScenarioMetadata[] = [{ scenarioName: 'Test', tags: [] }];

      const script = generator.generateK6File(scenarios, metadata, config);

      expect(script).toContain('export function teardown');
      expect(script).toContain('export function handleSummary');
      expect(script).toContain('htmlReport(data)');
      expect(script).toContain('textSummary(data');
    });
  });
});