# Project Brief: Ecoinvent Dataset Scraper

## Project Purpose
Create a robust web scraper that extracts specific data from ecoinvent.org dataset pages to enable data collection for further analysis. The scraper needs to navigate through dataset pages, extract structured data, and save it in an organized format.

## Core Requirements

1. **Data Extraction**: The scraper must extract the following elements from each dataset page:
   - Product name (e.g., "bisphenol A production, powder")
   - Geography
   - Reference Product
   - Unit
   - Full Documentation text

2. **Configurable Scraping**: The application should allow configuration of:
   - Range of dataset IDs to scrape
   - Request parameters (timeouts, delays, etc.)
   - Output format and location

3. **Resilience**: The scraper must handle:
   - Network errors
   - Missing data
   - Rate limiting
   - Error pages

4. **User Feedback**: Provide clear feedback on:
   - Progress of scraping operations
   - Success/failure statistics
   - Any issues encountered

## Success Criteria
- Successfully extracts all required data elements from ecoinvent dataset pages
- Saves data in structured JSON format for easy processing
- Operates reliably across the specified range of dataset IDs
- Handles errors gracefully without crashing
- Respects the target website by implementing appropriate rate limiting
