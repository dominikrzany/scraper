# Product Context: Ecoinvent Dataset Scraper

## Problem Statement
Researchers and analysts working with environmental data often need to collect and process large amounts of information from the ecoinvent database. Manually extracting this data is time-consuming, error-prone, and impractical for large datasets. There's a need for an automated solution that can efficiently and reliably extract structured data from the ecoinvent web interface.

## User Needs
- **Data Analysts**: Need clean, structured data for import into analysis tools
- **Researchers**: Need to collect specific environmental impact data across multiple products
- **Environmental Scientists**: Need to compare product specifications across different geographies
- **LCA Practitioners**: Need to access documentation for life cycle assessment

## Solution Overview
The Ecoinvent Dataset Scraper provides an automated solution that:
1. Navigates through ecoinvent dataset pages by ID
2. Extracts key data points (product name, geography, reference product, unit, documentation)
3. Processes the data into structured JSON format
4. Saves the results for further analysis
5. Provides feedback on progress and success/failure rates

## User Experience Goals
- **Simplicity**: Easy setup and configuration
- **Reliability**: Consistent results with proper error handling
- **Transparency**: Clear feedback on progress and issues
- **Flexibility**: Configurable to meet different scraping needs
- **Respectful**: Implementation of proper rate limiting to respect the target website

## Expected Usage Pattern
1. User configures the scraper for their specific needs (dataset range, timeouts, etc.)
2. User runs the scraper using a simple command
3. Scraper provides real-time feedback on progress
4. User accesses the extracted data from the output directory
5. User processes the structured data for their specific analysis needs
