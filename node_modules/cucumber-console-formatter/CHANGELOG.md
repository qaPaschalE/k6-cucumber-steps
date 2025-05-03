# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2021-01-18

### Added

- feat(formatter): inherits from SummaryFormatter

## [0.0.3] - 2021-01-08

### Fixed

- chore(npm): support node 12

## [0.0.2] - 2021-01-05

### Added

- feat(formatter): be able to console the Gherking steps

## [0.0.1] - 2021-01-05

### Added

- add debug capabilities : be able to save in json files all enveloppes received by this custom formatter.
  To activate this feature, setup the env variable `SimpleConsoleFormatter.printEnvelopes`:

  ```js
  process.env['SimpleConsoleFormatter.printEnvelopes'] = 'true';
  ```

  This will create by default a folder named `debug-console-formatter` at the root of your project. Inside this folder all enveloppes are stored in a unique-by-run folder
