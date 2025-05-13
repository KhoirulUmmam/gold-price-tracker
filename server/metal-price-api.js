import axios from 'axios';
import { storage } from './storage.js';

export class MetalPriceAPI {
  constructor() {
    this.lastFetchTime = null;
    this.lastData = null;
    this.API_URL = 'https://api.metals.live/v1/spot';
  }
  
  /**
   * Fetch gold price data from metals.live API
   */
  async fetchGoldPrice() {
    try {
      // Check if we've already fetched within the last 15 minutes
      const now = new Date();
      if (this.lastFetchTime && 
          (now.getTime() - this.lastFetchTime.getTime() < 15 * 60 * 1000) &&
          this.lastData) {
        console.log('Using cached gold price data (< 15 minutes old)');
        return this.lastData;
      }
      
      const response = await axios.get(this.API_URL);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from metals API');
      }
      
      // Find gold price from the response
      const goldData = response.data.find(item => item.gold);
      
      if (!goldData || !goldData.gold) {
        throw new Error('Gold price not found in the response');
      }
      
      // Convert from USD/oz to IDR/gram
      // 1 troy ounce = 31.1034768 grams
      // Exchange rate USD to IDR (approximate)
      const USD_TO_IDR = 15500; // This should be fetched from a currency API in production
      const TROY_OZ_TO_GRAM = 31.1034768;
      
      const priceUSD = goldData.gold;
      const pricePerGramIDR = Math.round((priceUSD * USD_TO_IDR) / TROY_OZ_TO_GRAM);
      
      // Typical spread in gold market
      const buyPrice = Math.round(pricePerGramIDR * 0.97); // 3% less than spot price
      const sellPrice = Math.round(pricePerGramIDR * 1.03); // 3% more than spot price
      
      const formattedData = {
        date: new Date(),
        pricePerGram: pricePerGramIDR,
        buyPrice: buyPrice,
        sellPrice: sellPrice,
        highPrice: null, // Not available from this API
        lowPrice: null, // Not available from this API
        source: 'metals.live'
      };
      
      // Cache the data
      this.lastFetchTime = now;
      this.lastData = formattedData;
      
      return formattedData;
    } catch (error) {
      console.error('Error fetching gold price data:', error.message);
      throw error;
    }
  }
  
  /**
   * Update gold price in the database
   */
  async updateGoldPrice() {
    try {
      const goldData = await this.fetchGoldPrice();
      
      // Check if goldData is valid
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

// Create singleton instance
export const metalPriceAPI = new MetalPriceAPI();
