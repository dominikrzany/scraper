# Ecoinvent Dataset Scraper

A Node.js application for scraping data from ecoinvent dataset pages.

## Features

- Scrapes the following data from each dataset:
  - Product name
  - Geography
  - Reference Product
  - Unit
  - Full Documentation
- Configurable dataset ID range
- Automatic retries for failed requests
- Rate limiting to avoid server overloading
- Progress bar and detailed logging
- Outputs data in structured JSON format

## Requirements

- Node.js (v14 or higher recommended)
- npm

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Configuration

You can modify the configuration settings in `config.js`:

- `startId` and `endId`: Range of dataset IDs to scrape
- `requestDelay`: Time in milliseconds between requests to avoid overloading the server
- `timeouts`: Various timeout settings
- `maxRetries`: Number of retries for failed requests

## Usage

Run the scraper:

```bash
npm start
```

This will:
1. Launch a headless browser
2. Visit each dataset page in the configured range
3. Extract the specified data
4. Save the data to JSON files in the `output` directory

## Output

The scraper saves each dataset as a separate JSON file with the following structure:

```json
{
  "id": 42,
  "productName": "bisphenol A production, powder",
  "geography": "Global",
  "referenceProduct": "bisphenol A",
  "unit": "kg",
  "documentation": "Full documentation text here..."
}
```

## Customization

If the structure of the ecoinvent website changes, you can modify the selectors in `utils/parser.js` to adapt to the new structure.
