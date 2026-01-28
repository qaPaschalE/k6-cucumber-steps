import * as messages from '@cucumber/messages'
import {
  Attachment,
  Duration,
  Feature,
  getWorstTestStepResult,
  GherkinDocument,
  Hook,
  Location,
  Meta,
  Pickle,
  PickleStep,
  Rule,
  Scenario,
  Step,
  StepDefinition,
  Suggestion,
  TestCase,
  TestCaseFinished,
  TestCaseStarted,
  TestRunFinished,
  TestRunHookFinished,
  TestRunHookStarted,
  TestRunStarted,
  TestStep,
  TestStepFinished,
  TestStepResult,
  TestStepResultStatus,
  TestStepStarted,
  TimeConversion,
  UndefinedParameterType,
} from '@cucumber/messages'
import { ArrayMultimap } from '@teppeis/multimaps'
import sortBy from 'lodash.sortby'

import { assert, statusOrdinal } from './helpers'
import { Lineage } from './Lineage'

export default class Query {
  private readonly testStepResultByPickleId = new ArrayMultimap<string, messages.TestStepResult>()
  private readonly testStepResultsByPickleStepId = new ArrayMultimap<
    string,
    messages.TestStepResult
  >()
  private readonly testCaseByPickleId = new Map<string, messages.TestCase>()
  private readonly pickleIdByTestStepId = new Map<string, string>()
  private readonly pickleStepIdByTestStepId = new Map<string, string>()
  private readonly testStepResultsbyTestStepId = new ArrayMultimap<
    string,
    messages.TestStepResult
  >()
  private readonly testStepIdsByPickleStepId = new ArrayMultimap<string, string>()
  private readonly hooksById = new Map<string, messages.Hook>()
  private readonly attachmentsByTestStepId = new ArrayMultimap<string, messages.Attachment>()
  private readonly stepMatchArgumentsListsByPickleStepId = new Map<
    string,
    readonly messages.StepMatchArgumentsList[]
  >()

  private meta: Meta
  private testRunStarted: TestRunStarted
  private testRunFinished: TestRunFinished
  private readonly testCaseStartedById: Map<string, TestCaseStarted> = new Map()
  private readonly lineageById: Map<string, Lineage> = new Map()
  private readonly stepById: Map<string, Step> = new Map()
  private readonly pickleById: Map<string, Pickle> = new Map()
  private readonly pickleStepById: Map<string, PickleStep> = new Map()
  private readonly stepDefinitionById: Map<string, StepDefinition> = new Map()
  private readonly testCaseById: Map<string, TestCase> = new Map()
  private readonly testStepById: Map<string, TestStep> = new Map()
  private readonly testCaseFinishedByTestCaseStartedId: Map<string, TestCaseFinished> = new Map()
  private readonly testRunHookStartedById: Map<string, TestRunHookStarted> = new Map()
  private readonly testRunHookFinishedByTestRunHookStartedId: Map<string, TestRunHookFinished> =
    new Map()
  private readonly testStepStartedByTestCaseStartedId: ArrayMultimap<string, TestStepStarted> =
    new ArrayMultimap()
  private readonly testStepFinishedByTestCaseStartedId: ArrayMultimap<string, TestStepFinished> =
    new ArrayMultimap()
  private readonly attachmentsByTestCaseStartedId: ArrayMultimap<string, Attachment> =
    new ArrayMultimap()
  private readonly attachmentsByTestRunHookStartedId: ArrayMultimap<string, Attachment> =
    new ArrayMultimap()
  private readonly suggestionsByPickleStepId: ArrayMultimap<string, Suggestion> =
    new ArrayMultimap()
  private readonly undefinedParameterTypes: UndefinedParameterType[] = []

  public update(envelope: messages.Envelope) {
    if (envelope.meta) {
      this.meta = envelope.meta
    }
    if (envelope.gherkinDocument) {
      this.updateGherkinDocument(envelope.gherkinDocument)
    }
    if (envelope.pickle) {
      this.updatePickle(envelope.pickle)
    }
    if (envelope.hook) {
      this.hooksById.set(envelope.hook.id, envelope.hook)
    }
    if (envelope.stepDefinition) {
      this.stepDefinitionById.set(envelope.stepDefinition.id, envelope.stepDefinition)
    }
    if (envelope.testRunStarted) {
      this.testRunStarted = envelope.testRunStarted
    }
    if (envelope.testRunHookStarted) {
      this.updateTestRunHookStarted(envelope.testRunHookStarted)
    }
    if (envelope.testRunHookFinished) {
      this.updateTestRunHookFinished(envelope.testRunHookFinished)
    }
    if (envelope.testCase) {
      this.updateTestCase(envelope.testCase)
    }
    if (envelope.testCaseStarted) {
      this.updateTestCaseStarted(envelope.testCaseStarted)
    }
    if (envelope.testStepStarted) {
      this.updateTestStepStarted(envelope.testStepStarted)
    }
    if (envelope.attachment) {
      this.updateAttachment(envelope.attachment)
    }
    if (envelope.testStepFinished) {
      this.updateTestStepFinished(envelope.testStepFinished)
    }
    if (envelope.testCaseFinished) {
      this.updateTestCaseFinished(envelope.testCaseFinished)
    }
    if (envelope.testRunFinished) {
      this.testRunFinished = envelope.testRunFinished
    }
    if (envelope.suggestion) {
      this.updateSuggestion(envelope.suggestion)
    }
    if (envelope.undefinedParameterType) {
      this.updateUndefinedParameterType(envelope.undefinedParameterType)
    }
  }

  private updateGherkinDocument(gherkinDocument: GherkinDocument) {
    if (gherkinDocument.feature) {
      this.updateFeature(gherkinDocument.feature, {
        gherkinDocument,
      })
    }
  }

  private updateFeature(feature: Feature, lineage: Lineage) {
    feature.children.forEach((featureChild) => {
      if (featureChild.background) {
        this.updateSteps(featureChild.background.steps)
      }
      if (featureChild.scenario) {
        this.updateScenario(featureChild.scenario, {
          ...lineage,
          feature,
        })
      }
      if (featureChild.rule) {
        this.updateRule(featureChild.rule, {
          ...lineage,
          feature,
        })
      }
    })
  }

  private updateRule(rule: Rule, lineage: Lineage) {
    rule.children.forEach((ruleChild) => {
      if (ruleChild.background) {
        this.updateSteps(ruleChild.background.steps)
      }
      if (ruleChild.scenario) {
        this.updateScenario(ruleChild.scenario, {
          ...lineage,
          rule,
        })
      }
    })
  }

  private updateScenario(scenario: Scenario, lineage: Lineage) {
    this.lineageById.set(scenario.id, {
      ...lineage,
      scenario,
    })
    scenario.examples.forEach((examples, examplesIndex) => {
      this.lineageById.set(examples.id, {
        ...lineage,
        scenario,
        examples,
        examplesIndex,
      })
      examples.tableBody.forEach((example, exampleIndex) => {
        this.lineageById.set(example.id, {
          ...lineage,
          scenario,
          examples,
          examplesIndex,
          example,
          exampleIndex,
        })
      })
    })
    this.updateSteps(scenario.steps)
  }

  private updateSteps(steps: ReadonlyArray<Step>) {
    steps.forEach((step) => this.stepById.set(step.id, step))
  }

  private updatePickle(pickle: Pickle) {
    this.pickleById.set(pickle.id, pickle)
    pickle.steps.forEach((pickleStep) => this.pickleStepById.set(pickleStep.id, pickleStep))
  }

  private updateTestRunHookStarted(testRunHookStarted: TestRunHookStarted) {
    this.testRunHookStartedById.set(testRunHookStarted.id, testRunHookStarted)
  }

  private updateTestRunHookFinished(testRunHookFinished: TestRunHookFinished) {
    this.testRunHookFinishedByTestRunHookStartedId.set(
      testRunHookFinished.testRunHookStartedId,
      testRunHookFinished
    )
  }

  private updateTestCase(testCase: TestCase) {
    this.testCaseById.set(testCase.id, testCase)

    this.testCaseByPickleId.set(testCase.pickleId, testCase)
    testCase.testSteps.forEach((testStep) => {
      this.testStepById.set(testStep.id, testStep)
      this.pickleIdByTestStepId.set(testStep.id, testCase.pickleId)
      this.pickleStepIdByTestStepId.set(testStep.id, testStep.pickleStepId)
      this.testStepIdsByPickleStepId.put(testStep.pickleStepId, testStep.id)
      this.stepMatchArgumentsListsByPickleStepId.set(
        testStep.pickleStepId,
        testStep.stepMatchArgumentsLists
      )
    })
  }

  private updateTestCaseStarted(testCaseStarted: TestCaseStarted) {
    this.testCaseStartedById.set(testCaseStarted.id, testCaseStarted)

    /*
    when a test case attempt starts besides the first one, clear all existing results
    and attachments for that test case, so we always report on the latest attempt
    (applies to legacy pickle-oriented query methods only)
     */
    const testCase = this.testCaseById.get(testCaseStarted.testCaseId)
    if (testCase) {
      this.testStepResultByPickleId.delete(testCase.pickleId)
      for (const testStep of testCase.testSteps) {
        this.testStepResultsByPickleStepId.delete(testStep.pickleStepId)
        this.testStepResultsbyTestStepId.delete(testStep.id)
        this.attachmentsByTestStepId.delete(testStep.id)
      }
    }
  }

  private updateTestStepStarted(testStepStarted: TestStepStarted) {
    this.testStepStartedByTestCaseStartedId.put(testStepStarted.testCaseStartedId, testStepStarted)
  }

  private updateAttachment(attachment: Attachment) {
    if (attachment.testStepId) {
      this.attachmentsByTestStepId.put(attachment.testStepId, attachment)
    }
    if (attachment.testCaseStartedId) {
      this.attachmentsByTestCaseStartedId.put(attachment.testCaseStartedId, attachment)
    }
    if (attachment.testRunHookStartedId) {
      this.attachmentsByTestRunHookStartedId.put(attachment.testRunHookStartedId, attachment)
    }
  }

  private updateTestStepFinished(testStepFinished: TestStepFinished) {
    this.testStepFinishedByTestCaseStartedId.put(
      testStepFinished.testCaseStartedId,
      testStepFinished
    )

    const pickleId = this.pickleIdByTestStepId.get(testStepFinished.testStepId)
    this.testStepResultByPickleId.put(pickleId, testStepFinished.testStepResult)
    const testStep = this.testStepById.get(testStepFinished.testStepId)
    this.testStepResultsByPickleStepId.put(testStep.pickleStepId, testStepFinished.testStepResult)
    this.testStepResultsbyTestStepId.put(testStep.id, testStepFinished.testStepResult)
  }

  private updateTestCaseFinished(testCaseFinished: TestCaseFinished) {
    this.testCaseFinishedByTestCaseStartedId.set(
      testCaseFinished.testCaseStartedId,
      testCaseFinished
    )
  }

  private updateSuggestion(suggestion: Suggestion) {
    this.suggestionsByPickleStepId.put(suggestion.pickleStepId, suggestion)
  }

  private updateUndefinedParameterType(undefinedParameterType: UndefinedParameterType) {
    this.undefinedParameterTypes.push(undefinedParameterType)
  }

  /**
   * Gets all the results for multiple pickle steps
   * @param pickleStepIds
   */
  public getPickleStepTestStepResults(
    pickleStepIds: readonly string[]
  ): readonly messages.TestStepResult[] {
    if (pickleStepIds.length === 0) {
      return [
        {
          status: messages.TestStepResultStatus.UNKNOWN,
          duration: messages.TimeConversion.millisecondsToDuration(0),
        },
      ]
    }
    return pickleStepIds.reduce((testStepResults: messages.TestStepResult[], pickleId) => {
      return testStepResults.concat(this.testStepResultsByPickleStepId.get(pickleId))
    }, [])
  }

  /**
   * Gets all the results for multiple pickles
   * @param pickleIds
   */
  public getPickleTestStepResults(
    pickleIds: readonly string[]
  ): readonly messages.TestStepResult[] {
    if (pickleIds.length === 0) {
      return [
        {
          status: messages.TestStepResultStatus.UNKNOWN,
          duration: messages.TimeConversion.millisecondsToDuration(0),
        },
      ]
    }
    return pickleIds.reduce((testStepResults: messages.TestStepResult[], pickleId) => {
      return testStepResults.concat(this.testStepResultByPickleId.get(pickleId))
    }, [])
  }

  /**
   * Gets all the attachments for multiple pickle steps
   * @param pickleStepIds
   */
  public getPickleStepAttachments(
    pickleStepIds: readonly string[]
  ): readonly messages.Attachment[] {
    return this.getTestStepsAttachments(
      pickleStepIds.reduce((testStepIds: string[], pickleStepId: string) => {
        return testStepIds.concat(this.testStepIdsByPickleStepId.get(pickleStepId))
      }, [])
    )
  }

  public getTestStepsAttachments(testStepIds: readonly string[]): readonly messages.Attachment[] {
    return testStepIds.reduce((attachments: messages.Attachment[], testStepId) => {
      return attachments.concat(this.attachmentsByTestStepId.get(testStepId))
    }, [])
  }

  /**
   * Get StepMatchArguments for a pickle step
   * @param pickleStepId
   */
  public getStepMatchArgumentsLists(
    pickleStepId: string
  ): readonly messages.StepMatchArgumentsList[] | undefined {
    return this.stepMatchArgumentsListsByPickleStepId.get(pickleStepId)
  }

  public getHook(hookId: string): messages.Hook {
    return this.hooksById.get(hookId)
  }

  public getBeforeHookSteps(pickleId: string): readonly messages.TestStep[] {
    const hookSteps: messages.TestStep[] = []

    this.identifyHookSteps(
      pickleId,
      (hook) => hookSteps.push(hook),
      () => null
    )
    return hookSteps
  }

  public getAfterHookSteps(pickleId: string): readonly messages.TestStep[] {
    const hookSteps: messages.TestStep[] = []

    this.identifyHookSteps(
      pickleId,
      () => null,
      (hook) => hookSteps.push(hook)
    )
    return hookSteps
  }

  private identifyHookSteps(
    pickleId: string,
    onBeforeHookFound: (hook: messages.TestStep) => void,
    onAfterHookFound: (hook: messages.TestStep) => void
  ): void {
    const testCase = this.testCaseByPickleId.get(pickleId)

    if (!testCase) {
      return
    }

    let pickleStepFound = false

    for (const step of testCase.testSteps) {
      if (step.hookId) {
        if (pickleStepFound) {
          onAfterHookFound(step)
        } else {
          onBeforeHookFound(step)
        }
      } else {
        pickleStepFound = true
      }
    }
  }

  public getTestStepResults(testStepId: string): messages.TestStepResult[] {
    return this.testStepResultsbyTestStepId.get(testStepId)
  }

  public getStatusCounts(
    pickleIds: readonly string[]
  ): Partial<Record<messages.TestStepResultStatus, number>> {
    const result: Partial<Record<messages.TestStepResultStatus, number>> = {}
    for (const pickleId of pickleIds) {
      const testStepResult = getWorstTestStepResult(this.getPickleTestStepResults([pickleId]))
      const count = result[testStepResult.status] || 0
      result[testStepResult.status] = count + 1
    }
    return result
  }

  /* new common interface with Java starts here */

  public countMostSevereTestStepResultStatus(): Record<TestStepResultStatus, number> {
    const result: Record<TestStepResultStatus, number> = {
      [TestStepResultStatus.AMBIGUOUS]: 0,
      [TestStepResultStatus.FAILED]: 0,
      [TestStepResultStatus.PASSED]: 0,
      [TestStepResultStatus.PENDING]: 0,
      [TestStepResultStatus.SKIPPED]: 0,
      [TestStepResultStatus.UNDEFINED]: 0,
      [TestStepResultStatus.UNKNOWN]: 0,
    }
    for (const testCaseStarted of this.findAllTestCaseStarted()) {
      const mostSevereResult = sortBy(
        this.findTestStepFinishedAndTestStepBy(testCaseStarted).map(
          ([testStepFinished]) => testStepFinished.testStepResult
        ),
        [(testStepResult) => statusOrdinal(testStepResult.status)]
      ).at(-1)
      if (mostSevereResult) {
        result[mostSevereResult.status]++
      }
    }
    return result
  }

  public countTestCasesStarted(): number {
    return this.findAllTestCaseStarted().length
  }

  public findAllPickles(): ReadonlyArray<Pickle> {
    return [...this.pickleById.values()]
  }

  public findAllPickleSteps(): ReadonlyArray<PickleStep> {
    return [...this.pickleStepById.values()]
  }

  public findAllStepDefinitions(): ReadonlyArray<StepDefinition> {
    return [...this.stepDefinitionById.values()]
  }

  public findAllTestCaseStarted(): ReadonlyArray<TestCaseStarted> {
    return sortBy(
      [...this.testCaseStartedById.values()].filter((testCaseStarted) => {
        const testCaseFinished = this.testCaseFinishedByTestCaseStartedId.get(testCaseStarted.id)
        // only include if not yet finished OR won't be retried
        return !testCaseFinished?.willBeRetried
      }),
      [
        (testCaseStarted) =>
          TimeConversion.timestampToMillisecondsSinceEpoch(testCaseStarted.timestamp),
        'id',
      ]
    )
  }

  public findAllTestCaseFinished(): ReadonlyArray<TestCaseFinished> {
    return sortBy(
      [...this.testCaseFinishedByTestCaseStartedId.values()].filter((testCaseFinished) => {
        // only include if not yet finished OR won't be retried
        return !testCaseFinished?.willBeRetried
      }),
      [
        (testCaseFinished) =>
          TimeConversion.timestampToMillisecondsSinceEpoch(testCaseFinished.timestamp),
        'id',
      ]
    )
  }

  public findAllTestSteps(): ReadonlyArray<TestStep> {
    return [...this.testStepById.values()]
  }

  public findAllTestStepStarted(): ReadonlyArray<TestStepStarted> {
    return [...this.testStepStartedByTestCaseStartedId.values()]
  }

  public findAllTestStepFinished(): ReadonlyArray<TestStepFinished> {
    return [...this.testStepFinishedByTestCaseStartedId.values()]
  }

  public findAllTestRunHookStarted(): ReadonlyArray<TestRunHookStarted> {
    return [...this.testRunHookStartedById.values()]
  }

  public findAllTestRunHookFinished(): ReadonlyArray<TestRunHookFinished> {
    return [...this.testRunHookFinishedByTestRunHookStartedId.values()]
  }

  public findAllUndefinedParameterTypes(): ReadonlyArray<UndefinedParameterType> {
    return [...this.undefinedParameterTypes]
  }

  public findAttachmentsBy(
    element: TestStepFinished | TestRunHookFinished
  ): ReadonlyArray<Attachment> {
    if ('testStepId' in element) {
      return this.attachmentsByTestCaseStartedId
        .get(element.testCaseStartedId)
        .filter((attachment) => attachment.testStepId === element.testStepId)
    } else {
      return this.attachmentsByTestRunHookStartedId.get(element.testRunHookStartedId)
    }
  }

  public findHookBy(item: TestStep | TestRunHookStarted | TestRunHookFinished): Hook | undefined {
    if ('testRunHookStartedId' in item) {
      const testRunHookStarted = this.findTestRunHookStartedBy(item)
      assert.ok(testRunHookStarted, 'Expected to find TestRunHookStarted from TestRunHookFinished')
      return this.findHookBy(testRunHookStarted)
    }
    if (!item.hookId) {
      return undefined
    }
    return this.hooksById.get(item.hookId)
  }

  public findMeta(): Meta | undefined {
    return this.meta
  }

  public findMostSevereTestStepResultBy(
    element: TestCaseStarted | TestCaseFinished
  ): TestStepResult | undefined {
    const testCaseStarted =
      'testCaseStartedId' in element ? this.findTestCaseStartedBy(element) : element
    return sortBy(
      this.findTestStepFinishedAndTestStepBy(testCaseStarted).map(
        ([testStepFinished]) => testStepFinished.testStepResult
      ),
      [(testStepResult) => statusOrdinal(testStepResult.status)]
    ).at(-1)
  }

  public findLocationOf(pickle: Pickle): Location | undefined {
    const lineage = this.findLineageBy(pickle)
    if (lineage?.example) {
      return lineage.example.location
    }
    return lineage?.scenario?.location
  }

  public findPickleBy(
    element: TestCaseStarted | TestCaseFinished | TestStepStarted
  ): Pickle | undefined {
    const testCase = this.findTestCaseBy(element)
    assert.ok(testCase, 'Expected to find TestCase from TestCaseStarted')
    return this.pickleById.get(testCase.pickleId)
  }

  public findPickleStepBy(testStep: TestStep): PickleStep | undefined {
    if (!testStep.pickleStepId) {
      return undefined
    }
    return this.pickleStepById.get(testStep.pickleStepId)
  }

  public findStepBy(pickleStep: PickleStep): Step | undefined {
    const [astNodeId] = pickleStep.astNodeIds
    assert.ok(astNodeId, 'Expected PickleStep to have an astNodeId')
    return this.stepById.get(astNodeId)
  }

  public findStepDefinitionsBy(testStep: TestStep): ReadonlyArray<StepDefinition> {
    return (testStep.stepDefinitionIds ?? []).map((id) => this.stepDefinitionById.get(id))
  }

  findSuggestionsBy(element: PickleStep | Pickle): ReadonlyArray<Suggestion> {
    if ('steps' in element) {
      return element.steps.flatMap((value) => this.findSuggestionsBy(value))
    }
    return this.suggestionsByPickleStepId.get(element.id)
  }

  public findUnambiguousStepDefinitionBy(testStep: TestStep): StepDefinition | undefined {
    if (testStep.stepDefinitionIds?.length === 1) {
      return this.stepDefinitionById.get(testStep.stepDefinitionIds[0])
    }
    return undefined
  }

  public findTestCaseBy(
    element: TestCaseStarted | TestCaseFinished | TestStepStarted | TestStepFinished
  ): TestCase | undefined {
    const testCaseStarted =
      'testCaseStartedId' in element ? this.findTestCaseStartedBy(element) : element
    assert.ok(testCaseStarted, 'Expected to find TestCaseStarted by TestStepStarted')
    return this.testCaseById.get(testCaseStarted.testCaseId)
  }

  public findTestCaseDurationBy(element: TestCaseStarted | TestCaseFinished): Duration | undefined {
    let testCaseStarted: TestCaseStarted
    let testCaseFinished: TestCaseFinished
    if ('testCaseStartedId' in element) {
      testCaseStarted = this.findTestCaseStartedBy(element)
      testCaseFinished = element
    } else {
      testCaseStarted = element
      testCaseFinished = this.findTestCaseFinishedBy(element)
    }
    if (!testCaseFinished) {
      return undefined
    }
    return TimeConversion.millisecondsToDuration(
      TimeConversion.timestampToMillisecondsSinceEpoch(testCaseFinished.timestamp) -
        TimeConversion.timestampToMillisecondsSinceEpoch(testCaseStarted.timestamp)
    )
  }

  public findTestCaseStartedBy(
    element: TestCaseFinished | TestStepStarted | TestStepFinished
  ): TestCaseStarted | undefined {
    return this.testCaseStartedById.get(element.testCaseStartedId)
  }

  public findTestCaseFinishedBy(testCaseStarted: TestCaseStarted): TestCaseFinished | undefined {
    return this.testCaseFinishedByTestCaseStartedId.get(testCaseStarted.id)
  }

  public findTestRunHookStartedBy(
    testRunHookFinished: TestRunHookFinished
  ): TestRunHookStarted | undefined {
    return this.testRunHookStartedById.get(testRunHookFinished.testRunHookStartedId)
  }

  public findTestRunHookFinishedBy(
    testRunHookStarted: TestRunHookStarted
  ): TestRunHookFinished | undefined {
    return this.testRunHookFinishedByTestRunHookStartedId.get(testRunHookStarted.id)
  }

  public findTestRunDuration(): Duration | undefined {
    if (!this.testRunStarted || !this.testRunFinished) {
      return undefined
    }
    return TimeConversion.millisecondsToDuration(
      TimeConversion.timestampToMillisecondsSinceEpoch(this.testRunFinished.timestamp) -
        TimeConversion.timestampToMillisecondsSinceEpoch(this.testRunStarted.timestamp)
    )
  }

  public findTestRunFinished(): TestRunFinished | undefined {
    return this.testRunFinished
  }

  public findTestRunStarted(): TestRunStarted | undefined {
    return this.testRunStarted
  }

  public findTestStepBy(element: TestStepStarted | TestStepFinished): TestStep | undefined {
    return this.testStepById.get(element.testStepId)
  }

  public findTestStepsStartedBy(
    element: TestCaseStarted | TestCaseFinished
  ): ReadonlyArray<TestStepStarted> {
    const testCaseStartedId =
      'testCaseStartedId' in element ? element.testCaseStartedId : element.id
    // multimaps `get` implements `getOrDefault([])` behaviour internally
    return [...this.testStepStartedByTestCaseStartedId.get(testCaseStartedId)]
  }

  public findTestStepsFinishedBy(
    element: TestCaseStarted | TestCaseFinished
  ): ReadonlyArray<TestStepFinished> {
    const testCaseStarted =
      'testCaseStartedId' in element ? this.findTestCaseStartedBy(element) : element
    // multimaps `get` implements `getOrDefault([])` behaviour internally
    return [...this.testStepFinishedByTestCaseStartedId.get(testCaseStarted.id)]
  }

  public findTestStepFinishedAndTestStepBy(
    testCaseStarted: TestCaseStarted
  ): ReadonlyArray<[TestStepFinished, TestStep]> {
    return this.testStepFinishedByTestCaseStartedId
      .get(testCaseStarted.id)
      .map((testStepFinished) => {
        const testStep = this.findTestStepBy(testStepFinished)
        assert.ok(testStep, 'Expected to find TestStep by TestStepFinished')
        return [testStepFinished, testStep]
      })
  }

  public findLineageBy(element: Pickle | TestCaseStarted | TestCaseFinished): Lineage | undefined {
    const pickle = 'astNodeIds' in element ? element : this.findPickleBy(element)
    const deepestAstNodeId = pickle.astNodeIds.at(-1)
    assert.ok(deepestAstNodeId, 'Expected Pickle to have at least one astNodeId')
    return this.lineageById.get(deepestAstNodeId)
  }
}
