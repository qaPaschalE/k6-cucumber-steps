import { describe, it, expect, beforeEach } from 'vitest';
import { FeatureParser } from '../src/generators/feature.parser';

describe('FeatureParser', () => {
  let parser: FeatureParser;

  beforeEach(() => {
    parser = new FeatureParser();
  });

  describe('loadAndParseFeatures', () => {
    it('parses a simple feature file with background and scenario', async () => {
      const features = await parser.loadAndParseFeatures('./test/fixtures/simple.feature');

      expect(features.length).toBe(1);
      expect(features[0].scenarios.length).toBe(2);

      // First scenario should have background step prepended
      const simpleGet = features[0].scenarios.find(s => s.name === 'Simple GET');
      expect(simpleGet).toBeDefined();
      expect(simpleGet!.steps.length).toBe(3); // background + 2 steps
      expect(simpleGet!.steps[0].text).toBe('the k6 base URL is "https://api.example.com"');
      expect(simpleGet!.tags).toContain('smoke');
      expect(simpleGet!.tags).toContain('vus:10');
      expect(simpleGet!.tags).toContain('duration:30s');
      expect(simpleGet!.tags).toContain('group:api');

      // Second scenario
      const postScenario = features[0].scenarios.find(s => s.name === 'POST with body');
      expect(postScenario).toBeDefined();
      expect(postScenario!.steps.length).toBe(4); // background + 3 steps
      expect(postScenario!.steps[1].argument).toBeDefined(); // DocString for post data
    });
  });

  describe('wiki: Scenario Outline quoting', () => {
    it('wraps unquoted Examples values in quotes so the step function resolves', async () => {
      const features = await parser.loadAndParseFeatures('./test/fixtures/outline.feature');
      const scenarios = features[0].scenarios;

      // 3 rows => 3 expanded scenarios
      expect(scenarios.length).toBe(3);

      // The status assertion step text should contain a QUOTED status code,
      // so normalizeStepText yields k6TheResponseStatusShouldBe (not ...Be200)
      const row1StatusStep = scenarios[0].steps.find(s =>
        s.text.includes('response status should be'),
      );
      expect(row1StatusStep).toBeDefined();
      expect(row1StatusStep!.text).toBe('the k6 response status should be "200"');

      // And the endpoint should also be quoted
      const getStep = scenarios[0].steps.find(s => s.text.includes('GET request'));
      expect(getStep!.text).toBe('I k6 make a GET request to "/users/1"');

      // Last row
      const row3StatusStep = scenarios[2].steps.find(s =>
        s.text.includes('response status should be'),
      );
      expect(row3StatusStep!.text).toBe('the k6 response status should be "404"');
    });
  });

  describe('loadScenarioMetadata', () => {
    it('extracts vus, duration, stages, threshold, group from tags', () => {
      const scenarios = [
        {
          name: 'Test',
          tags: ['smoke', 'vus:10', 'duration:30s', 'stages:0s-0,10s-5', 'threshold:http_req_duration=p(95)<500', 'group:api'],
          steps: [],
        },
      ];

      const metadata = parser.loadScenarioMetadata(scenarios as any);

      expect(metadata[0].vus).toBe(10);
      expect(metadata[0].duration).toBe('30s');
      expect(metadata[0].stages).toBe('0s-0,10s-5');
      expect(metadata[0].thresholds).toEqual({ http_req_duration: 'p(95)<500' });
      expect(metadata[0].group).toBe('api');
    });

    it('handles missing tags gracefully', () => {
      const scenarios = [{ name: 'Test', tags: [], steps: [] }];
      const metadata = parser.loadScenarioMetadata(scenarios as any);
      expect(metadata[0].vus).toBeUndefined();
      expect(metadata[0].duration).toBeUndefined();
    });
  });
});