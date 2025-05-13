# System Patterns: Ecoinvent Dataset Scraper

## Architecture Overview

The scraper follows a modular architecture with clear separation of concerns:

```
┌─────────────┐
│   index.js  │  Main entry point
└─────┬───────┘
      │
      ▼
┌─────────────┐    ┌─────────────┐
│  config.js  │◄───│ logger.js   │  Configuration & logging
└─────────────┘    └─────────────┘
      │                   ▲
      │                   │
      ▼                   │
┌─────────────┐           │
│  parser.js  │───────────┘  Data extraction & processing
└─────────────┘
```

## Key Technical Decisions

1. **Headless Browser Approach**: 
   - Using Playwright for browser automation rather than direct HTTP requests.
   - Rationale: The target website likely relies on client-side rendering with JavaScript, making headless browser navigation necessary for accessing all content.

2. **Modular Component Structure**:
   - Separated concerns into distinct modules (config, parser, logger).
   - Rationale: Enhances maintainability and makes it easier to update individual components when needed.

3. **Robust Error Handling**:
   - Implemented multi-level error handling with retries.
   - Rationale: Web scraping is inherently prone to intermittent failures due to network issues, page loading problems, or target site changes.

4. **Rate Limiting**:
   - Built-in delays between requests to avoid overwhelming the server.
   - Rationale: Respectful scraping practices are essential for avoiding IP blocks and server strain.

## Design Patterns

1. **Singleton Pattern**:
   - Used for logger and parser utilities to ensure consistent access across the application.
   - Implementation: Single exports of instantiated classes.

2. **Configuration Object Pattern**:
   - Centralized configuration in a dedicated module.
   - Benefits: Easy adjustment of scraper behavior without code changes.

3. **Async/Await Pattern**:
   - Consistent use of modern JavaScript async/await for handling asynchronous operations.
   - Benefits: Cleaner code and better error handling compared to callbacks or promise chains.

4. **Retry Pattern**:
   - Implementation of automatic retries with exponential backoff for failed requests.
   - Benefits: Increased resilience against transient errors.

## Component Relationships

### 1. Main Script (index.js)
- Orchestrates the scraping process
- Manages browser lifecycle
- Coordinates between other components

### 2. Configuration (config.js)
- Defines all configurable parameters
- Used by all other components
- Single source of truth for application settings

### 3. Parser (utils/parser.js)
- Extracts data from web pages
- Implements flexible selection strategies to handle variations in page structure
- Returns structured data objects

### 4. Logger (utils/logger.js)
- Provides progress visualization
- Handles error reporting
- Outputs statistics and status information

## Critical Implementation Paths

1. **Browser Initialization**:
   ```
   index.js → chromium.launch() → browser.newContext() → context.newPage()
   ```

2. **Page Navigation and Data Extraction**:
   ```
   index.js → page.goto(url) → parser.extractDataFromPage() → saveData()
   ```

3. **Error Handling Flow**:
   ```
   try/catch → retries logic → logger.error() → continue loop
   ```

4. **Progress Reporting**:
   ```
   logger.initProgressBar() → scrape loop → logger.updateProgress() → logger.stopProgress()
   ```
