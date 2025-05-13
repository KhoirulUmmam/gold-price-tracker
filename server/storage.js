import { db } from "../db/index.js";
import * as schema from "../shared/schema.js";
import { eq, lte, gte, desc, asc, and, sql } from "drizzle-orm";

// Gold Prices methods
export const storage = {
  // Gold price operations
  async getCurrentGoldPrice() {
    try {
      const prices = await db.select()
        .from(schema.goldPrices)
        .orderBy(desc(schema.goldPrices.date))
        .limit(1);
      
      if (prices.length === 0) {
        return null;
      }
      
      // Get yesterday's price for change calculations
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const yesterdayPrices = await db.select()
        .from(schema.goldPrices)
        .where(
          and(
            lte(schema.goldPrices.date, yesterday),
            gte(schema.goldPrices.date, new Date(yesterday.getTime() - 24 * 60 * 60 * 1000))
          )
        )
        .orderBy(desc(schema.goldPrices.date))
        .limit(1);
      
      const currentPrice = prices[0];
      const yesterdayPrice = yesterdayPrices.length > 0 ? yesterdayPrices[0] : null;
      
      // Calculate changes
      if (yesterdayPrice) {
        currentPrice.priceChange = parseFloat(currentPrice.pricePerGram) - parseFloat(yesterdayPrice.pricePerGram);
        currentPrice.buyPriceChange = parseFloat(currentPrice.buyPrice) - parseFloat(yesterdayPrice.buyPrice);
        currentPrice.sellPriceChange = parseFloat(currentPrice.sellPrice) - parseFloat(yesterdayPrice.sellPrice);
      } else {
        currentPrice.priceChange = 0;
        currentPrice.buyPriceChange = 0;
        currentPrice.sellPriceChange = 0;
      }
      
      return currentPrice;
    } catch (error) {
      console.error("Error getting current gold price:", error);
      throw error;
    }
  },
  
  async insertGoldPrice(goldPriceData) {
    try {
      const [newGoldPrice] = await db.insert(schema.goldPrices)
        .values(goldPriceData)
        .returning();
      
      return newGoldPrice;
    } catch (error) {
      console.error("Error inserting gold price:", error);
      throw error;
    }
  },
  
  async getGoldPriceHistory(timeframe = '7d') {
    try {
      const dateLimit = new Date();
      
      // Set appropriate date range based on timeframe
      switch (timeframe) {
        case '1d':
          dateLimit.setDate(dateLimit.getDate() - 1);
          break;
        case '1w':
          dateLimit.setDate(dateLimit.getDate() - 7);
          break;
        case '1m':
          dateLimit.setMonth(dateLimit.getMonth() - 1);
          break;
        case '3m':
          dateLimit.setMonth(dateLimit.getMonth() - 3);
          break;
        case '6m':
          dateLimit.setMonth(dateLimit.getMonth() - 6);
          break;
        case '1y':
          dateLimit.setFullYear(dateLimit.getFullYear() - 1);
          break;
        case 'all':
          // No date limit for all data
          dateLimit.setFullYear(2000);
          break;
        default:
          dateLimit.setDate(dateLimit.getDate() - 7);
      }
      
      const prices = await db.select()
        .from(schema.goldPrices)
        .where(gte(schema.goldPrices.date, dateLimit))
        .orderBy(desc(schema.goldPrices.date));
      
      // Calculate daily changes and percentage changes
      if (prices.length > 0) {
        for (let i = 0; i < prices.length - 1; i++) {
          const current = prices[i];
          const previous = prices[i + 1];
          
          current.dailyChange = parseFloat(current.pricePerGram) - parseFloat(previous.pricePerGram);
          current.changePercent = (current.dailyChange / parseFloat(previous.pricePerGram)) * 100;
        }
        
        // For the oldest record in the range, set change to 0 if no previous data
        if (prices.length > 0) {
          const oldest = prices[prices.length - 1];
          if (!oldest.dailyChange) {
            oldest.dailyChange = 0;
            oldest.changePercent = 0;
          }
        }
      }
      
      return prices;
    } catch (error) {
      console.error("Error getting gold price history:", error);
      throw error;
    }
  },
  
  async getChartData(timeframe = '1d') {
    try {
      const priceHistory = await this.getGoldPriceHistory(timeframe);
      
      // Transform for chart display
      const chartData = priceHistory.map(price => {
        const date = new Date(price.date);
        
        // Format label based on timeframe
        let label;
        if (timeframe === '1d') {
          label = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (timeframe === '1w') {
          label = date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
        } else {
          label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        
        return {
          label,
          price: parseFloat(price.pricePerGram)
        };
      });
      
      // Reverse to show oldest first for charting
      return chartData.reverse();
    } catch (error) {
      console.error("Error getting chart data:", error);
      throw error;
    }
  },
  
  async getRecentPriceChanges(limit = 5) {
    try {
      const prices = await db.select()
        .from(schema.goldPrices)
        .orderBy(desc(schema.goldPrices.date))
        .limit(limit + 1); // Get one extra for difference calculation
      
      if (prices.length <= 1) {
        return [];
      }
      
      const changes = [];
      
      // Process buy and sell price changes
      for (let i = 0; i < prices.length - 1; i++) {
        const current = prices[i];
        const previous = prices[i + 1];
        
        // Buy price change
        if (parseFloat(current.buyPrice) !== parseFloat(previous.buyPrice)) {
          changes.push({
            id: `buy-${current.id}`,
            date: current.date,
            price: parseFloat(current.buyPrice),
            change: parseFloat(current.buyPrice) - parseFloat(previous.buyPrice),
            type: 'Buy Price'
          });
        }
        
        // Sell price change
        if (parseFloat(current.sellPrice) !== parseFloat(previous.sellPrice)) {
          changes.push({
            id: `sell-${current.id}`,
            date: current.date,
            price: parseFloat(current.sellPrice),
            change: parseFloat(current.sellPrice) - parseFloat(previous.sellPrice),
            type: 'Sell Price'
          });
        }
      }
      
      // Sort by date (newest first) and limit to requested number
      return changes.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
    } catch (error) {
      console.error("Error getting recent price changes:", error);
      throw error;
    }
  },
  
  // Price Alerts operations
  async getPriceAlerts() {
    try {
      const alerts = await db.select()
        .from(schema.priceAlerts)
        .where(eq(schema.priceAlerts.active, true))
        .orderBy(desc(schema.priceAlerts.createdAt));
      
      return alerts;
    } catch (error) {
      console.error("Error getting price alerts:", error);
      throw error;
    }
  },
  
  async getPriceAlertById(id) {
    try {
      const alerts = await db.select()
        .from(schema.priceAlerts)
        .where(eq(schema.priceAlerts.id, id))
        .limit(1);
      
      return alerts.length > 0 ? alerts[0] : null;
    } catch (error) {
      console.error("Error getting price alert by ID:", error);
      throw error;
    }
  },
  
  async createPriceAlert(alertData) {
    try {
      const [newAlert] = await db.insert(schema.priceAlerts)
        .values(alertData)
        .returning();
      
      return newAlert;
    } catch (error) {
      console.error("Error creating price alert:", error);
      throw error;
    }
  },
  
  async updatePriceAlert(id, alertData) {
    try {
      const [updatedAlert] = await db.update(schema.priceAlerts)
        .set(alertData)
        .where(eq(schema.priceAlerts.id, id))
        .returning();
      
      return updatedAlert;
    } catch (error) {
      console.error("Error updating price alert:", error);
      throw error;
    }
  },
  
  async updateAlertLastTriggered(id) {
    try {
      await db.update(schema.priceAlerts)
        .set({
          lastTriggered: new Date()
        })
        .where(eq(schema.priceAlerts.id, id));
    } catch (error) {
      console.error("Error updating alert last triggered time:", error);
      throw error;
    }
  },
  
  async deletePriceAlert(id) {
    try {
      await db.delete(schema.priceAlerts)
        .where(eq(schema.priceAlerts.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting price alert:", error);
      throw error;
    }
  },
  
  // Notification Logs operations
  async createNotificationLog(logData) {
    try {
      const [newLog] = await db.insert(schema.notificationLogs)
        .values(logData)
        .returning();
      
      return newLog;
    } catch (error) {
      console.error("Error creating notification log:", error);
      throw error;
    }
  },
  
  async getNotificationLogs(limit = 100) {
    try {
      const logs = await db.select()
        .from(schema.notificationLogs)
        .orderBy(desc(schema.notificationLogs.sentAt))
        .limit(limit);
      
      return logs;
    } catch (error) {
      console.error("Error getting notification logs:", error);
      throw error;
    }
  },
  
  // Investments operations
  async getInvestments() {
    try {
      const investments = await db.select()
        .from(schema.investments)
        .orderBy(desc(schema.investments.purchaseDate));
      
      return investments;
    } catch (error) {
      console.error("Error getting investments:", error);
      throw error;
    }
  },
  
  async createInvestment(investmentData) {
    try {
      const [newInvestment] = await db.insert(schema.investments)
        .values(investmentData)
        .returning();
      
      return newInvestment;
    } catch (error) {
      console.error("Error creating investment:", error);
      throw error;
    }
  },
  
  async updateInvestment(id, investmentData) {
    try {
      const [updatedInvestment] = await db.update(schema.investments)
        .set(investmentData)
        .where(eq(schema.investments.id, id))
        .returning();
      
      return updatedInvestment;
    } catch (error) {
      console.error("Error updating investment:", error);
      throw error;
    }
  },
  
  async deleteInvestment(id) {
    try {
      await db.delete(schema.investments)
        .where(eq(schema.investments.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting investment:", error);
      throw error;
    }
  }
};
