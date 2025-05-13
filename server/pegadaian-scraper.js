import axios from 'axios';
import * as cheerio from 'cheerio';
import { storage } from './storage.js';

const PEGADAIAN_URL = 'https://www.pegadaian.co.id/harga-emas';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

export class PegadaianScraper {
  constructor() {
    this.lastScrapeTime = null;
    this.lastData = null;
  }
  
  /**
   * Fetch the HTML content from Pegadaian website
   */
  async fetchPage() {
    try {
      const response = await axios.get(PEGADAIAN_URL, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching Pegadaian page:', error.message);
      throw new Error(`Failed to fetch Pegadaian data: ${error.message}`);
    }
  }
  
  /**
   * Parse the HTML and extract gold price data
   */
  parseGoldPrices(html) {
    try {
      const $ = cheerio.load(html);
      const goldData = {};
      
      // Get the date from the page (usually there's a date indicator)
      const dateText = $('.price-gold-chart .date').text().trim();
      goldData.date = dateText || new Date().toISOString();
      
      // Extract price per gram (standard gold price)
      const pricePerGramText = $('.items-price .data-price').first().text().trim();
      goldData.pricePerGram = this.extractNumber(pricePerGramText);
      
      // Extract buy price and sell price
      const buyPriceText = $('.items-price:contains("Harga Beli") .data-price').text().trim();
      const sellPriceText = $('.items-price:contains("Harga Jual") .data-price').text().trim();
      
      goldData.buyPrice = this.extractNumber(buyPriceText) || goldData.pricePerGram;
      goldData.sellPrice = this.extractNumber(sellPriceText) || (goldData.pricePerGram * 0.915); // Typical buyback is ~91.5% of sell price
      
      // Add additional data
      goldData.source = 'pegadaian';
      
      // If we can find today's high and low
      const highPriceText = $('.items-price:contains("Tertinggi") .data-price').text().trim();
      const lowPriceText = $('.items-price:contains("Terendah") .data-price').text().trim();
      
      if (highPriceText) {
        goldData.highPrice = this.extractNumber(highPriceText);
      }
      
      if (lowPriceText) {
        goldData.lowPrice = this.extractNumber(lowPriceText);
      }
      
      return goldData;
    } catch (error) {
      console.error('Error parsing gold prices:', error.message);
      throw new Error(`Failed to parse gold prices: ${error.message}`);
    }
  }
  
  /**
   * Extract price number from a string
   */
  extractNumber(text) {
    // First, check if the text is null or undefined
    if (!text) return null;
    
    // Remove all non-numeric characters except decimal point
    const numericString = text.replace(/[^\d]/g, '');
    
    if (numericString) {
      return parseInt(numericString, 10);
    }
    
    return null;
  }
  
  /**
   * Main function to fetch and process gold price data
   */
  async fetchGoldPrices() {
    try {
      // Check if we've already scraped within the last 15 minutes
      const now = new Date();
      if (this.lastScrapeTime && 
          (now.getTime() - this.lastScrapeTime.getTime() < 15 * 60 * 1000) &&
          this.lastData) {
        console.log('Using cached gold price data (< 15 minutes old)');
        return this.lastData;
      }
      
      const html = await this.fetchPage();
      const goldData = this.parseGoldPrices(html);
      
      // Update cache
      this.lastScrapeTime = now;
      this.lastData = goldData;
      
      return goldData;
    } catch (error) {
      console.error('Error in fetchGoldPrices:', error.message);
      throw error;
    }
  }
  
  /**
   * Fetch, process and store gold price data
   */
  async updateGoldPrices() {
    try {
      const goldData = await this.fetchGoldPrices();
      
      // Check if goldData is valid before saving to database
      if (!goldData || goldData.buyPrice === null || goldData.sellPrice === null || goldData.pricePerGram === null) {
        console.error('Gold data is incomplete or invalid:', goldData);
        throw new Error('Failed to get valid gold price data');
      }
      
      // Save to database
      const savedData = await storage.insertGoldPrice({
        date: new Date(),
        buyPrice: goldData.buyPrice.toString(),
        sellPrice: goldData.sellPrice.toString(),
        pricePerGram: goldData.pricePerGram.toString(),
        source: goldData.source,
        highPrice: goldData.highPrice ? goldData.highPrice.toString() : null,
        lowPrice: goldData.lowPrice ? goldData.lowPrice.toString() : null
      });
      
      console.log('Successfully updated gold prices:', savedData);
      
      return savedData;
    } catch (error) {
      console.error('Error updating gold prices:', error.message);
      throw error;
    }
  }
  
  /**
   * Check for price alerts that should be triggered
   */
  async checkPriceAlerts() {
    try {
      // Get current price
      const currentPrice = await storage.getCurrentGoldPrice();
      if (!currentPrice) return [];
      
      // Get active alerts
      const alerts = await storage.getPriceAlerts();
      
      const triggeredAlerts = [];
      
      for (const alert of alerts) {
        // Skip daily summaries as they're sent on schedule, not by price change
        if (alert.alertType === 'daily') continue;
        
        // Check if price crosses the target
        const targetPrice = parseFloat(alert.targetPrice);
        const currentPriceValue = parseFloat(currentPrice.pricePerGram);
        
        if (!isNaN(targetPrice) && !isNaN(currentPriceValue)) {
          if (alert.alertType === 'increase' && currentPriceValue >= targetPrice) {
            triggeredAlerts.push(alert);
          } else if (alert.alertType === 'decrease' && currentPriceValue <= targetPrice) {
            triggeredAlerts.push(alert);
          }
        }
      }
      
      return { triggeredAlerts, currentPrice };
    } catch (error) {
      console.error('Error checking price alerts:', error.message);
      throw error;
    }
  }
}

// Create a singleton instance
export const pegadaianScraper = new PegadaianScraper();
