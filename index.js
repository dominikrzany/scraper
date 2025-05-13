/**
 * Ecoinvent Product Name Scraper
 * 
 * This script scrapes product names from ecoinvent dataset pages and saves them to a CSV file.
 * It:
 * 1. Loops through specified IDs
 * 2. Goes to each URL and waits for .chakra-stack to be visible
 * 3. Extracts product name from h4.chakra-heading and other data points
 * 4. Saves all data to a CSV file
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const config = require('./config');

/**
 * Sleep function for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after the specified time
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create CSV writer for saving data
 * @returns {Object} Configured CSV writer
 */
/**
 * Create CSV writer for saving data
 * @param {boolean} append - Whether to append to existing file
 * @returns {Object} Configured CSV writer
 */
function createCsvFile(append = false) {
  const outputPath = path.join(config.outputDir, 'ecoinvent_data.csv');
  const csvWriter = createCsvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'productName', title: 'Product Name' },
      { id: 'geography', title: 'Geography' },
      { id: 'referenceProduct', title: 'Reference Product' },
      { id: 'unit', title: 'Unit' },
      { id: 'documentation', title: 'Documentation' }
    ],
    append: append // Set to true to append to existing file instead of overwriting
  });
  
  return csvWriter;
}

/**
 * Main scraping function
 */
async function scrapeProductNames() {
  // Use the variables from the config file
  const debugStartId = config.startId;
  const debugEndId = config.endId;
  
  // Ensure output directory exists
  await fs.ensureDir(config.outputDir);
  
  // Check if CSV file exists and create appropriate CSV writers
  const csvPath = path.join(config.outputDir, 'ecoinvent_data.csv');
  let fileExists = false;
  try {
    const stats = await fs.stat(csvPath);
    fileExists = stats.isFile();
    console.log(`CSV file ${fileExists ? 'already exists - will append to it' : 'does not exist - will create new file'}`);
  } catch (error) {
    console.log('CSV file does not exist yet - will create new file');
  }
  
  // Create two CSV writers - one for initialization and one for appending
  // We'll use initialCsvWriter only if the file doesn't exist yet
  const initialCsvWriter = createCsvFile(false); // For writing headers (not append)
  const appendCsvWriter = createCsvFile(true);   // For appending data
  
  // If file doesn't exist yet, initialize it with headers only
  if (!fileExists) {
    console.log('Initializing new CSV file with headers...');
    await initialCsvWriter.writeRecords([]);
  }
  
  // Array to collect all results for tracking purposes only
  const allResults = [];
  
  console.log('Starting ecoinvent product name scraper');
  console.log(`ID range: ${debugStartId} to ${debugEndId}`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  // Track progress
  const totalDatasets = debugEndId - debugStartId + 1;
  console.log(`Starting to scrape ${totalDatasets} datasets from ecoinvent`);
  
  let successCount = 0;
  let errorCount = 0;
  
  try {
    for (let id = debugStartId; id <= debugEndId; id++) {
      // Construct the URL
      const URL = `${config.baseUrl}/${id}`;
      console.log(`[${id}] Processing URL: ${URL}`);
      
      try {
        // STEP 1: Go to the page
        await page.goto(URL, { timeout: config.timeouts.navigation });
        
        // STEP 2: Wait for .chakra-stack to be visible
        await page.waitForSelector('.chakra-stack', { 
          state: 'visible', 
          timeout: config.timeouts.selector 
        });

        // Check for error page with Oh No message
        let hasErrorPage = false;
        try {
          const errorHeading = await page.waitForSelector('h1.chakra-heading', {
            state: 'visible',
            timeout: 1000,
            filter: (element) => element.textContent.includes('Oh No')
          });
          
          if (errorHeading) {
            console.log(`[${id}] Found "Oh No..." error page, skipping dataset`);
            hasErrorPage = true;
            
            // Create error record for Oh No error pages
            const errorRecord = {
              id,
              productName: 'Error: Error page detected',
              geography: '',
              referenceProduct: '',
              unit: '',
              documentation: ''
            };
            
            // Add to results array and write to CSV immediately
            allResults.push(errorRecord);
            console.log(`[${id}] Writing error record to CSV...`);
            await appendCsvWriter.writeRecords([errorRecord]);
            
            errorCount++;
            continue; // Skip to next ID
          }
        } catch(error) {
          // No error page found, continue with scraping
        }
      
        // Wait for data to be loaded (not placeholders) 
        await page.waitForFunction(() => {
          const productHeading = document.querySelector('h4.chakra-heading');
          return productHeading && 
                 productHeading.textContent.trim() !== '' && 
                 productHeading.textContent.trim() !== 'Dataset';
        }, { timeout: config.timeouts.navigation });
        
        // STEP 3: Extract data
        // Extract product name
        const productName = await page.evaluate(() => {
          const productHeading = document.querySelector('h4.chakra-heading');
          return productHeading ? productHeading.textContent.trim() : 'Product name not found';
        });

        // Extract geography
        const geography = await page.evaluate(() => {
          // Find the Geography heading
          const geographyHeadings = Array.from(document.querySelectorAll('h2.chakra-heading')).filter(
            heading => heading.textContent.trim() === 'Geography'
          );
          
          if (geographyHeadings.length > 0) {
            const geographyHeading = geographyHeadings[0];
            
            // Go up 3 levels to main container
            let parentContainer = geographyHeading;
            
            // Step 1: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Geography not found (parent 1)';
            
            // Step 2: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Geography not found (parent 2)';
            
            // Step 3: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Geography not found (parent 3)';
            
            // Find the chakra-text element
            const geographyText = parentContainer.querySelector('p.chakra-text');
            if (geographyText) {
              return geographyText.textContent.trim();
            }
          }
          
          return 'Geography not found';
        });
        
        // Extract Reference Product
        const referenceProduct = await page.evaluate(() => {
          // Find the Reference Product heading
          const refProductHeadings = Array.from(document.querySelectorAll('h2.chakra-heading')).filter(
            heading => heading.textContent.trim() === 'Reference Product'
          );
          
          if (refProductHeadings.length > 0) {
            const refProductHeading = refProductHeadings[0];
            
            // Go up 3 levels to main container
            let parentContainer = refProductHeading;
            
            // Step 1: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Reference Product not found (parent 1)';
            
            // Step 2: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Reference Product not found (parent 2)';
            
            // Step 3: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Reference Product not found (parent 3)';
            
            // Find the chakra-text element
            const refProductText = parentContainer.querySelector('p.chakra-text');
            if (refProductText) {
              return refProductText.textContent.trim();
            }
          }
          
          return 'Reference Product not found';
        });
        
        // Extract Unit
        const unit = await page.evaluate(() => {
          // Find the Unit heading
          const unitHeadings = Array.from(document.querySelectorAll('h2.chakra-heading')).filter(
            heading => heading.textContent.trim() === 'Unit'
          );
          
          if (unitHeadings.length > 0) {
            const unitHeading = unitHeadings[0];
            
            // Go up 3 levels to main container
            let parentContainer = unitHeading;
            
            // Step 1: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Unit not found (parent 1)';
            
            // Step 2: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Unit not found (parent 2)';
            
            // Step 3: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Unit not found (parent 3)';
            
            // Find the chakra-text element
            const unitText = parentContainer.querySelector('p.chakra-text');
            if (unitText) {
              return unitText.textContent.trim();
            }
          }
          
          return 'Unit not found';
        });
        
        // Wait for Documentation to be loaded but only for 2 seconds 
        let documentationFound = false;
        try {
          await page.waitForSelector('h2.chakra-heading:text("Documentation")', { 
            state: 'visible', 
            timeout: 2000 // Only wait 2 seconds
          });
          documentationFound = true;
        } catch (error) {
          console.log(`[${id}] Documentation section not found within 2 seconds, will use default value`);
        }
        
        // Extract Documentation - Simple direct approach exactly like the other fields
        const documentation = documentationFound ? await page.evaluate(() => {
          // Find the Documentation heading
          const docHeadings = Array.from(document.querySelectorAll('h2.chakra-heading')).filter(
            heading => heading.textContent.trim() === 'Documentation'
          );
          
          if (docHeadings.length > 0) {
            const docHeading = docHeadings[0];
            
            // Go up exactly 3 levels to main container - just like other fields
            let parentContainer = docHeading;
            
            // Step 1: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Documentation not found (parent 1)';
            
            // Step 2: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Documentation not found (parent 2)';
            
            // Step 3: Go to parent
            parentContainer = parentContainer.parentElement;
            if (!parentContainer) return 'Documentation not found (parent 3)';
            
            // Get the chakra-text element's content, just like other fields
            const docText = parentContainer.textContent;
            if (docText) {
              return docText.trim();
            }
          }
          
          return 'Documentation not found';
        }) : 'Documentation section skipped (timeout)';
        
        // Create data record for this dataset
        const dataRecord = {
          id,
          productName,
          geography,
          referenceProduct,
          unit,
          documentation
        };
        
        // Add to the results array for tracking
        allResults.push(dataRecord);
        
        // Write this record to CSV immediately - using append mode
        console.log(`[${id}] Writing data to CSV file...`);
        await appendCsvWriter.writeRecords([dataRecord]);
        
        // Log the extracted data
        console.log(`[${id}] Extracted data:
- Product Name: "${productName}"
- Geography: "${geography}"
- Reference Product: "${referenceProduct}"
- Unit: "${unit}"
- Documentation: "${documentation.substring(0, 100)}${documentation.length > 100 ? '...' : ''}"
`);
        
        successCount++;
      } catch (error) {
        console.error(`[${id}] Error: ${error.message}`);
        errorCount++;
        
        // Create error record
        const errorRecord = {
          id,
          productName: 'Error: ' + error.message,
          geography: '',
          referenceProduct: '',
          unit: '',
          documentation: ''
        };
        
        // Add error entry to results array
        allResults.push(errorRecord);
        
        // Write error record to CSV immediately
        console.log(`[${id}] Writing error record to CSV...`);
        await appendCsvWriter.writeRecords([errorRecord]);
      }
      
      // Rate limiting between requests
      await sleep(config.requestDelay);
    }
  } finally {
    // Close browser
    await browser.close();
    
    // No need to write CSV file again - all records have already been written immediately after extraction
    
    // Get full path to CSV file for output summary
    const csvPath = path.resolve(path.join(config.outputDir, 'ecoinvent_data.csv'));
    console.log(`Successfully wrote ${allResults.length} records to CSV file: ${csvPath}`);
    
    // Final stats
    console.log(`Scraping completed. Results:`);
    console.log(`- Total datasets attempted: ${totalDatasets}`);
    console.log(`- Successfully scraped: ${successCount}`);
    console.log(`- Failed to scrape: ${errorCount}`);
    console.log(`- Success rate: ${((successCount / totalDatasets) * 100).toFixed(2)}%`);
  }
}

// Run the scraper
scrapeProductNames()
  .catch(error => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
