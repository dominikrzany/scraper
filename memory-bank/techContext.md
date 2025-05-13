# Technical Context: Ecoinvent Dataset Scraper

## Technologies Used

### Core Technologies
- **Node.js**: Runtime environment for executing JavaScript code server-side
- **JavaScript (ES6+)**: Programming language used throughout the application
- **Playwright**: Browser automation library for navigating and interacting with web pages

### Supporting Libraries
- **fs-extra**: Enhanced file system methods for file operations
- **cli-progress**: Terminal progress bar for visualizing scraper progress
- **chalk**: Terminal string styling for more readable console output
- **path**: Node.js path module for file path operations

## Development Setup

### Environment Requirements
- Node.js v14+ installed
- npm or yarn for package management
- Internet connection for accessing the ecoinvent website

### Project Structure
```
ecoinvent-scraper/
├── index.js           # Main entry point
├── config.js          # Configuration settings
├── package.json       # Project metadata and dependencies
├── README.md          # Documentation
├── output/            # Directory for scraped data
└── utils/
    ├── logger.js      # Logging and progress tracking
    └── parser.js      # HTML parsing and data extraction
```

### Installation Process
1. Clone/download the repository
2. Run `npm install` to install dependencies
3. Configure settings in `config.js` (if needed)
4. Execute with `npm start`

## Technical Constraints

### External Dependencies
- **Target Website Structure**: The scraper relies on the current HTML structure of ecoinvent.org. Changes to their website may require updates to the selectors in parser.js.

### Performance Considerations
- **Memory Usage**: When scraping large datasets, memory usage should be monitored
- **Network Reliability**: Connection stability affects scraping success rate
- **Target Server Limitations**: Rate limiting from the target server may affect scraping speed

### Ethical and Legal Considerations
- **Rate Limiting**: Implemented to avoid overloading target servers
- **Terms of Service**: Users should ensure compliance with ecoinvent's terms of service
- **Data Usage**: Extracted data should be used in accordance with ecoinvent's data usage policies

## Dependencies

### Primary Dependencies
- **playwright**: ^1.34.0
  - Purpose: Browser automation for navigating and extracting data from web pages
  - Key features used: Page navigation, content extraction, headless mode

- **fs-extra**: ^11.1.1
  - Purpose: Enhanced file system operations
  - Key features used: Writing JSON files, creating directories

- **cli-progress**: ^3.12.0
  - Purpose: Visual progress indication in terminal
  - Key features used: Progress bar with completion percentage

- **chalk**: ^4.1.2
  - Purpose: Terminal string styling
  - Key features used: Colored console output for better readability

### Dependency Management
- **package.json**: Centralized dependency management
- **npm**: Package installation and scripts execution

## Tool Usage Patterns

### Browser Automation (Playwright)
- **Browser Launch**: Headless mode is used to run without a visible UI
- **Page Navigation**: Direct navigation to dataset URLs with timeout handling
- **Selector Strategies**: Multiple selector approaches for resilient data extraction
- **Element Evaluation**: Page evaluation methods to extract text content

### File Operations (fs-extra)
- **Directory Creation**: Ensuring output directory exists before writing
- **JSON Writing**: Structured data saved in JSON format for each dataset

### Progress Visualization (cli-progress)
- **Bar Initialization**: Created with total count of datasets to process
- **Progress Updates**: Updated after each dataset is processed
- **Completion Handling**: Progress bar stops when scraping completes

### Console Output (chalk)
- **Color Coding**: Different colors for different message types (info, error, success)
- **Status Messages**: Formatted messages for key events during scraping
