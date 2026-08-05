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

    it('removes quoted strings and normalizes', () => {
      expect(normalize('the k6 base URL is "https://example.com"')).toBe('theK6BaseUrlIs');
      expect(normalize('I k6 make a GET request to "/users/1"')).toBe('iK6MakeAGetRequestTo');
      expect(normalize('the k6 response status should be "200"')).toBe('theK6ResponseStatusShouldBe');
    });

    it('handles unquoted numbers (Scenario Outline expansion)', () => {
      expect(normalize('the k6 response status should be 200')).toBe('theK6ResponseStatusShouldBe200');
      // Note: This produces theK6ResponseStatusShouldBe200 but exported fn is theK6ResponseStatusShouldBe
      // This is a known gap - outline rows with numeric expectedStatus will fail
    });

    it('preserves words in their original order (no k6 repositioning)', () => {
      expect(normalize('I k6 make a GET request to "/users/1"')).toBe('iK6MakeAGetRequestTo');
      expect(normalize('I k6 click on the element "button"')).toBe('iK6ClickOnTheElement');
    });

    it('strips "with headers" suffix', () => {
      expect(normalize('I k6 make a GET request to "/users/1" with headers:')).toBe('iK6MakeAGetRequestTo');
    });

    it('handles multiple quoted args', () => {
      expect(normalize('I k6 fill the field "#input-field" with "First" "1"')).toBe('iK6FillTheFieldWith');
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
      expect(script).toContain('steps.theK6BaseUrlIs("https://api.example.com")');
      expect(script).toContain('steps.iK6MakeAGetRequestTo("/users/1")');
      expect(script).toContain('steps.theK6ResponseStatusShouldBe("200")');
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
      expect(script).toContain('await steps.iK6NavigateToThePage(page, "/home")');
      expect(script).toContain('await steps.iK6ShouldSeeTheText(page, "Welcome")');
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
      
      // Verify hooks are injected
      expect(script).toContain('steps.beforeAll');
      expect(script).toContain('steps.afterAll');
      expect(script).toContain('steps.before');
      expect(script).toContain('steps.after');
    });
  });
});