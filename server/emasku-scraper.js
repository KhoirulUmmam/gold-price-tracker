import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage.js';

export class EmaskuScraper {
  constructor() {
    this.sourceUrl = 'https://emasku.co.id/Harga_emas';
    this.sourceName = 'Emasku';
  }

  /**
   * Fetch the HTML content from Emasku website
   */
  async fetchPage() {
    try {
      console.log(`Fetching gold price data from ${this.sourceUrl}`);
      // Increase timeout to 15 seconds and enhance headers for better compatibility
      const response = await axios.get(this.sourceUrl, { 
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Connection': 'keep-alive'
        }
      });
      console.log(`Successfully fetched page from ${this.sourceName}`);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error(`Timeout error fetching page from ${this.sourceName}:`, error.message);
        throw new Error(`Timeout fetching data from ${this.sourceName}`);
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Error response from ${this.sourceName}:`, error.response.status, error.response.statusText);
        throw new Error(`Server error (${error.response.status}) from ${this.sourceName}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error(`No response received from ${this.sourceName}:`, error.message);
        throw new Error(`No response from ${this.sourceName}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(`Error fetching page from ${this.sourceName}:`, error.message);
        throw new Error(`Failed to fetch data from ${this.sourceName}: ${error.message}`);
      }
    }
  }

  /**
   * Parse the HTML and extract gold price data
   */
  parseGoldPrices(html) {
    try {
      console.log(`Parsing HTML from ${this.sourceName}...`);
      const $ = cheerio.load(html);
      const goldPrices = [];
      let regularPriceFound = false;

      // Find the table with gold prices
      const table = $('table.table').first();
      
      if (!table.length) {
        console.error(`No table found on ${this.sourceName} website`);
        throw new Error(`Could not find price table in ${this.sourceName} website`);
      }
      
      console.log(`Found price table in ${this.sourceName} website`);
      
      // Look for 1 gram gold price in the REGULAR section
      table.find('tr').each((index, row) => {
        const rowText = $(row).text().trim();
        
        // Look for the REGULAR section header
        if (rowText.includes('REGULAR')) {
          console.log(`Found REGULAR section in ${this.sourceName} table`);
          regularPriceFound = true;
          return; // Continue to next row
        }
        
        // We're only interested in the REGULAR section and specifically 1 gram gold
        if (regularPriceFound) {
          const weightText = $(row).find('td').first().text().trim();
          
          if (weightText === '1 gr') {
            console.log(`Found 1 gram gold price in ${this.sourceName} REGULAR section`);
            const cells = $(row).find('td');
            
            // Format: <td>1 gr</td><td>Rp.</td><td class="text-end">1,874,000</td><td>Rp.</td><td class="text-end">1,789,000</td>
            if (cells.length >= 5) {
              // Get the buy price (index 2)
              const buyPriceText = $(cells[2]).text().trim();
              const buyPrice = this.extractNumber(buyPriceText);
              
              // Get the sell price (index 4)
              const sellPriceText = $(cells[4]).text().trim();
              const sellPrice = this.extractNumber(sellPriceText);
              
              console.log(`Extracted prices - Buy: ${buyPrice} IDR/gram, Sell: ${sellPrice} IDR/gram`);
              
              // Validate the extracted prices
              if (buyPrice <= 0 || sellPrice <= 0) {
                console.error(`Invalid prices extracted from ${this.sourceName}: Buy=${buyPrice}, Sell=${sellPrice}`);
                throw new Error(`Invalid price values from ${this.sourceName}`);
              }
              
              goldPrices.push({
                date: new Date(),
                source: this.sourceName,
                weight: 1, // 1 gram
                buyPrice: buyPrice,
                sellPrice: sellPrice
              });
              
              // Once we find the 1 gram price, we can stop processing
              return false;
            } else {
              console.error(`Insufficient cells (${cells.length}) in 1 gram row of ${this.sourceName} table`);
            }
          }
        }
      });

      if (!regularPriceFound) {
        console.error(`Could not find REGULAR section in ${this.sourceName} table`);
        throw new Error(`REGULAR section not found in ${this.sourceName} table`);
      }
      
      if (goldPrices.length === 0) {
        console.error(`No valid gold price data found in ${this.sourceName} table`);
        throw new Error(`No valid gold price data found from ${this.sourceName}`);
      }

      console.log(`Successfully parsed gold price data from ${this.sourceName}`);
      return goldPrices[0]; // Return the first (and should be only) price entry
    } catch (error) {
      console.error(`Error parsing HTML from ${this.sourceName}:`, error.message);
      throw new Error(`Failed to parse data from ${this.sourceName}: ${error.message}`);
    }
  }

  /**
   * Extract price number from a string
   */
  extractNumber(text) {
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

  /**
   * Main function to fetch and process gold price data
   */
  async fetchGoldPrices() {
    try {
      const html = await this.fetchPage();
      return this.parseGoldPrices(html);
    } catch (error) {
      console.error(`Error in fetchGoldPrices from ${this.sourceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Fetch, process and store gold price data
   */
  async updateGoldPrices() {
    try {
      const priceData = await this.fetchGoldPrices();
      
      if (!priceData || !priceData.buyPrice) {
        throw new Error(`Invalid gold price data from ${this.sourceName}`);
      }
      
      // Store in database with all required fields
      await storage.insertGoldPrice({
        date: new Date(),
        price: priceData.buyPrice,           // Main price (required)
        buyPrice: priceData.buyPrice,        // Buy price (required)
        sellPrice: priceData.sellPrice,      // Sell price (required)
        pricePerGram: priceData.buyPrice,    // Price per gram (required)
        source: this.sourceName,
        unit: 'gram',
        currency: 'IDR'
      });
      
      console.log(`Gold price data updated from ${this.sourceName}: ${priceData.buyPrice} IDR/gram`);
      return priceData;
    } catch (error) {
      console.error(`Failed to update gold prices from ${this.sourceName}:`, error.message);
      throw error;
    }
  }

  /**
   * Check for price alerts that should be triggered
   */
  async checkPriceAlerts() {
    try {
      const currentPrice = await storage.getCurrentGoldPrice();
      if (!currentPrice) return;

      const alerts = await storage.getPriceAlerts();
      const now = new Date();

      for (const alert of alerts) {
        // Skip inactive alerts
        if (!alert.isActive) continue;

        // Skip alerts that were triggered recently based on frequency settings
        if (alert.lastTriggered) {
          const lastTriggered = new Date(alert.lastTriggered);
          const hoursDiff = (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60);

          // Skip if the alert was triggered too recently
          if (hoursDiff < alert.frequency) continue;
        }

        let shouldTrigger = false;

        // Check if the alert should be triggered
        if (alert.alertType === 'increase' && currentPrice.price >= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.alertType === 'decrease' && currentPrice.price <= alert.targetPrice) {
          shouldTrigger = true;
        } else if (alert.alertType === 'daily') {
          // For daily alerts, check if it's around the time specified
          const alertHour = parseInt(alert.dailyTime.split(':')[0], 10);
          const currentHour = now.getHours();
          
          if (alertHour === currentHour) {
            shouldTrigger = true;
          }
        }

        if (shouldTrigger) {
          console.log(`Triggering alert: ${alert.id}`);
          
          // Update the last triggered timestamp
          await storage.updateAlertLastTriggered(alert.id);
          
          // Log the notification
          await storage.createNotificationLog({
            alertId: alert.id,
            sentAt: now,
            currentPrice: currentPrice.price,
            message: `Alert triggered: ${alert.alertType} at ${currentPrice.price}`
          });
          
          // Send notifications based on preferences
          if (alert.notifyTelegram && alert.telegramChatId) {
            // Send Telegram notification
            // telegramNotifier.sendPriceAlert(alert, currentPrice);
          }
          
          if (alert.notifyWhatsapp && alert.phoneNumber) {
            // Send WhatsApp notification
            // whatsAppNotifier.sendPriceAlert(alert, currentPrice);
          }
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }
}

export const emaskuScraper = new EmaskuScraper();
