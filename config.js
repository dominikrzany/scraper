/**
 * Configuration for the ecoinvent scraper
 */
module.exports = {
  // Base URL for the ecoinvent dataset pages
  baseUrl: 'https://ecoquery.ecoinvent.org/3.11/cutoff/dataset',
  
  // Range of dataset IDs to scrape
  startId: 1,
  endId: 10, // Testing with fewer IDs
  
  // Timeouts (in milliseconds)
  timeouts: {
    navigation: 30000,    // Page navigation timeout (increased - more time to load)
    selector: 15000,      // Wait for selector timeout (increased - more time to appear)
  },
  
  // Retry settings
  maxRetries: 1,          // Maximum number of retries per dataset (reduced)
  retryDelay: 1000,       // Delay between retries (ms) (reduced)
  
  // Output settings
  outputDir: './output',
  
  // Rate limiting (milliseconds between requests)
  requestDelay: 500,      // Reduced delay between requests
};
