import axios from 'axios';
import * as cheerio from 'cheerio';

async function testEmaskuScraper() {
  try {
    console.log('Starting Emasku scraper test...');
    const url = 'https://emasku.co.id/Harga_emas';
    
    // Make the request with enhanced options
    console.log(`Fetching data from ${url}`);
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    
    console.log('Response received successfully!');
    
    // Load the HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Extract some basic information to verify the content
    const title = $('title').text();
    console.log(`Page title: ${title}`);
    
    // Find the table with gold prices
    const table = $('table.table').first();
    if (!table.length) {
      console.log('Error: Could not find the price table');
      return;
    }
    
    console.log('Found the price table!');
    
    // Look for the REGULAR section and 1 gram gold price
    let regularPriceFound = false;
    let goldPriceFound = false;
    
    table.find('tr').each((index, row) => {
      const rowText = $(row).text().trim();
      console.log(`Row ${index} text: ${rowText.substring(0, 50)}...`);
      
      // Check if this is the REGULAR section header
      if (rowText.includes('REGULAR')) {
        console.log('Found REGULAR section!');
        regularPriceFound = true;
        return; // Continue to next row
      }
      
      // If we're in the REGULAR section, look for 1 gram gold
      if (regularPriceFound) {
        const weightText = $(row).find('td').first().text().trim();
        if (weightText === '1 gr') {
          console.log('Found 1 gram gold price row!');
          goldPriceFound = true;
          
          const cells = $(row).find('td');
          
          // Format: <td>1 gr</td><td>Rp.</td><td class="text-end">1,874,000</td><td>Rp.</td><td class="text-end">1,789,000</td>
          if (cells.length >= 5) {
            const buyPriceText = $(cells[2]).text().trim();
            const sellPriceText = $(cells[4]).text().trim();
            
            console.log(`Buy price text: ${buyPriceText}`);
            console.log(`Sell price text: ${sellPriceText}`);
            
            // Extract numeric values
            const buyPrice = extractNumber(buyPriceText);
            const sellPrice = extractNumber(sellPriceText);
            
            console.log(`Buy price: ${buyPrice} IDR/gram`);
            console.log(`Sell price: ${sellPrice} IDR/gram`);
          }
          
          return false; // Stop iteration
        }
      }
    });
    
    if (!regularPriceFound) {
      console.log('Warning: REGULAR section not found in the table');
    }
    
    if (!goldPriceFound) {
      console.log('Warning: 1 gram gold price not found in the REGULAR section');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error in test:');
    if (error.code === 'ECONNABORTED') {
      console.error('Timeout error:', error.message);
    } else if (error.response) {
      console.error('Error response:', error.response.status, error.response.statusText);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

function extractNumber(text) {
  try {
    // Remove any non-digit characters except commas and dots
    const numericString = text.replace(/[^0-9,.]/g, '');
    // Remove commas and convert to number
    return parseInt(numericString.replace(/,/g, ''), 10);
  } catch (error) {
    console.error('Error extracting number:', error);
    return 0;
  }
}

// Run the test
testEmaskuScraper();
