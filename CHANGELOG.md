# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Package name is `typed-api-contract` (`react-api-contract` is already published on npm at 1.0.1).

### Added

- Phase 0: frozen public API surface for `typed-api-contract`, `typed-api-contract/client`, and `typed-api-contract/react-query`. See `docs/PUBLIC_API.md`.
- Phase 1: unit, integration, and type tests; inference-budget check; `prepublishOnly` runs tests then build.
