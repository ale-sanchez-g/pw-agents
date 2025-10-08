# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-08

### Added

#### Accessibility Agent
- Automated accessibility testing using axe-core
- Support for workflow-based testing (test accessibility after user interactions)
- Multi-page accessibility testing
- Detailed violation reports with severity levels (critical, serious, moderate, minor)
- JSON and HTML report generation
- Overall summary for multi-page tests

#### API Agent
- Swagger/OpenAPI document parsing and validation
- Automated endpoint testing for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Request/response validation against schemas
- Batch testing of all endpoints defined in Swagger document
- Automatic test data generation from Swagger schemas
- JSON and HTML report generation
- Success rate tracking and reporting

#### Performance Agent
- Page load time measurement
- Web Vitals collection (FCP, LCP, TTI, TBT, CLS)
- Lighthouse integration for comprehensive performance audits
- NFR (Non-Functional Requirements) validation
- Load testing with multiple iterations and statistics (min, max, average, median, p95, p99)
- Resource timing analysis (scripts, stylesheets, images, fonts)
- JSON and HTML report generation
- Customizable performance thresholds

#### Documentation
- Comprehensive README with usage examples and API documentation
- Getting Started guide for new users
- Contributing guidelines for developers
- Example scripts for each agent
- Integration example combining all three agents
- Sample API specification for testing

#### Testing
- Playwright test suite for all agents
- Unit tests for core functionality
- Validation script to verify agent structure
- Example usage scripts

#### Configuration
- Playwright configuration
- npm scripts for running tests and examples
- Package configuration with proper dependencies

### Dependencies
- @playwright/test: ^1.56.0
- @axe-core/playwright: ^4.10.2
- swagger-parser: ^10.0.3
- lighthouse: ^12.8.2

[1.0.0]: https://github.com/ale-sanchez-g/pw-agents/releases/tag/v1.0.0
