import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { pegadaianScraper } from "./pegadaian-scraper.js";
import { metalPriceAPI } from "./metal-price-api.js";
import { emaskuScraper } from "./emasku-scraper.js";
import { telegramNotifier } from "./telegram-notifier.js";
import { whatsAppNotifier } from "./whatsapp-notifier.js";
import cron from "node-cron";
import { goldPricesInsertSchema, priceAlertsInsertSchema, investmentsInsertSchema } from "../shared/schema.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup API routes with prefix
  const apiPrefix = "/api";
  
  // Initialize price updates at startup
  try {
    // Try to update prices from Emasku first
    try {
      console.log("Trying to initialize gold price data from Emasku...");
      await emaskuScraper.updateGoldPrices();
      console.log("Initialized gold price data from Emasku");
    } catch (emaskuError) {
      console.log("Failed to get data from Emasku, trying Pegadaian...");
      try {
        await pegadaianScraper.updateGoldPrices();
        console.log("Initialized gold price data from Pegadaian");
      } catch (pegadaianError) {
        // If both fail, try the metal price API
        console.log("Failed to get data from Pegadaian, trying alternative API...");
        await metalPriceAPI.updateGoldPrice();
        console.log("Initialized gold price data from alternative API");
      }
    }
  } catch (error) {
    console.error("Failed to initialize gold price data from all sources:", error);
  }
  
  // Schedule regular price updates
  cron.schedule("0 */1 * * *", async () => {
    try {
      console.log("Running scheduled gold price update");
      
      // Try to update prices from Emasku first
      try {
        console.log("Trying to get scheduled price data from Emasku...");
        await emaskuScraper.updateGoldPrices();
        console.log("Updated gold price data from Emasku");
        
        // Check for price alerts
        await emaskuScraper.checkPriceAlerts();
      } catch (emaskuError) {
        console.log("Failed to get scheduled data from Emasku, trying Pegadaian...");
        
        try {
          // Try to update prices from Pegadaian
          await pegadaianScraper.updateGoldPrices();
          console.log("Updated gold price data from Pegadaian");
          
          // Check for price alerts using Pegadaian data
          const { triggeredAlerts, currentPrice } = await pegadaianScraper.checkPriceAlerts();
          
          // Send notifications for triggered alerts
          for (const alert of triggeredAlerts) {
            try {
              // Send telegram notification
              if (alert.telegramEnabled && alert.telegramChatId) {
                await telegramNotifier.sendPriceAlert(alert, currentPrice);
              }
              
              // Send WhatsApp notification
              if (alert.whatsappEnabled && alert.phoneNumber) {
                await whatsAppNotifier.sendPriceAlert(alert, currentPrice);
              }
            } catch (notificationError) {
              console.error(`Error sending notification for alert ${alert.id}:`, notificationError);
            }
          }
        } catch (pegadaianError) {
          // If both Emasku and Pegadaian fail, try the metal price API
          console.log("Failed to get data from Pegadaian, trying alternative API...");
          
          await metalPriceAPI.updateGoldPrice();
          console.log("Updated gold price data from alternative API");
          
          // Check for price alerts using alternative API data
          const { triggeredAlerts, currentPrice } = await metalPriceAPI.checkPriceAlerts();
          
          // Send notifications for triggered alerts
          for (const alert of triggeredAlerts) {
            try {
              // Send telegram notification
              if (alert.telegramEnabled && alert.telegramChatId) {
                await telegramNotifier.sendPriceAlert(alert, currentPrice);
              }
              
              // Send WhatsApp notification
              if (alert.whatsappEnabled && alert.phoneNumber) {
                await whatsAppNotifier.sendPriceAlert(alert, currentPrice);
              }
            } catch (notificationError) {
              console.error(`Error sending notification for alert ${alert.id}:`, notificationError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Scheduled gold price update failed from all sources:", error);
    }
  });
  
  // Schedule daily summary notifications
  cron.schedule("0 * * * *", async () => {
    try {
      // Get current hour
      const currentHour = new Date().getHours();
      const currentHourStr = currentHour < 10 ? `0${currentHour}:00` : `${currentHour}:00`;
      
      // Get daily summary alerts for this hour
      const allAlerts = await storage.getPriceAlerts();
      const dailySummaryAlerts = allAlerts.filter(alert => 
        alert.alertType === 'daily' && 
        alert.dailyTime && 
        alert.dailyTime.startsWith(currentHourStr.slice(0, 2))
      );
      
      if (dailySummaryAlerts.length > 0) {
        console.log(`Sending ${dailySummaryAlerts.length} daily summary notifications for hour ${currentHourStr}`);
        
        // Get current price data
        const currentPrice = await storage.getCurrentGoldPrice();
        
        // Send notifications
        for (const alert of dailySummaryAlerts) {
          try {
            // Send telegram notification
            if (alert.telegramEnabled && alert.telegramChatId) {
              await telegramNotifier.sendDailySummary(alert, currentPrice);
            }
            
            // Send WhatsApp notification
            if (alert.whatsappEnabled && alert.phoneNumber) {
              await whatsAppNotifier.sendDailySummary(alert, currentPrice);
            }
          } catch (notificationError) {
            console.error(`Error sending daily summary for alert ${alert.id}:`, notificationError);
          }
        }
      }
    } catch (error) {
      console.error("Daily summary notification check failed:", error);
    }
  });
  
  //
  // Gold Price Routes
  //
  
  // Get current gold price
  app.get(`${apiPrefix}/gold-prices/current`, async (req: Request, res: Response) => {
    try {
      let currentPrice = await storage.getCurrentGoldPrice();
      const refresh = req.query.refresh === 'true';
      const source = req.query.source as string;
      
      console.log(`Get current price request - refresh: ${refresh}, source: ${source || 'not specified'}`);
      
      // If no price data exists, or data is older than 3 hours, or refresh is requested, fetch fresh data
      if (!currentPrice || (new Date().getTime() - new Date(currentPrice.date).getTime() > 3 * 60 * 60 * 1000) || refresh) {
        // Allow selecting a specific source
        if (source === 'emasku') {
          try {
            console.log("Explicitly requested Emasku data source");
            await emaskuScraper.updateGoldPrices();
            currentPrice = await storage.getCurrentGoldPrice();
            console.log("Successfully fetched price data from Emasku");
          } catch (emaskuError: any) {
            console.error("Failed to get price data from Emasku:", emaskuError.message);
            throw new Error(`Failed to fetch from Emasku: ${emaskuError.message}`);
          }
        } else if (source === 'pegadaian') {
          try {
            console.log("Explicitly requested Pegadaian data source");
            await pegadaianScraper.updateGoldPrices();
            currentPrice = await storage.getCurrentGoldPrice();
            console.log("Successfully fetched price data from Pegadaian");
          } catch (pegadaianError: any) {
            console.error("Failed to get price data from Pegadaian:", pegadaianError.message);
            throw new Error(`Failed to fetch from Pegadaian: ${pegadaianError.message}`);
          }
        } else if (source === 'metals') {
          try {
            console.log("Explicitly requested Metals.live data source");
            await metalPriceAPI.updateGoldPrice();
            currentPrice = await storage.getCurrentGoldPrice();
            console.log("Successfully fetched price data from Metals.live");
          } catch (metalsError: any) {
            console.error("Failed to get price data from Metals.live:", metalsError.message);
            throw new Error(`Failed to fetch from Metals.live: ${metalsError.message}`);
          }
        } else {
          // Try all sources in sequence with fallback
          try {
            // Try Emasku first (primary source)
            console.log("Trying to get price data from Emasku...");
            await emaskuScraper.updateGoldPrices();
            currentPrice = await storage.getCurrentGoldPrice();
            console.log("Successfully fetched price data from Emasku");
          } catch (emaskuError: any) {
            console.log("Failed to get price data from Emasku, trying Pegadaian...", emaskuError.message);
            try {
              // Try Pegadaian as second option
              await pegadaianScraper.updateGoldPrices();
              currentPrice = await storage.getCurrentGoldPrice();
              console.log("Successfully fetched price data from Pegadaian");
            } catch (pegadaianError: any) {
              // If both fail, try the alternative API
              console.log("Failed to get current price from Pegadaian, trying alternative API...");
              await metalPriceAPI.updateGoldPrice();
              currentPrice = await storage.getCurrentGoldPrice();
              console.log("Successfully fetched price data from alternative API");
            }
          }
        }
      }
      
      if (!currentPrice) {
        return res.status(404).json({ message: "No gold price data available" });
      }
      
      res.json(currentPrice);
    } catch (error) {
      console.error("Error fetching current gold price:", error);
      res.status(500).json({ message: "Error fetching current gold price" });
    }
  });
  
  // Get gold price history
  app.get(`${apiPrefix}/gold-prices/history`, async (req: Request, res: Response) => {
    try {
      const timeframe = req.query.timeframe as string || '7d';
      const priceHistory = await storage.getGoldPriceHistory(timeframe);
      res.json(priceHistory);
    } catch (error) {
      console.error("Error fetching gold price history:", error);
      res.status(500).json({ message: "Error fetching gold price history" });
    }
  });
  
  // Get chart data
  app.get(`${apiPrefix}/gold-prices/chart`, async (req: Request, res: Response) => {
    try {
      const timeframe = req.query.timeframe as string || '1d';
      const chartData = await storage.getChartData(timeframe);
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ message: "Error fetching chart data" });
    }
  });
  
  // Get recent price changes
  app.get(`${apiPrefix}/gold-prices/recent-changes`, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const recentChanges = await storage.getRecentPriceChanges(limit);
      res.json(recentChanges);
    } catch (error) {
      console.error("Error fetching recent price changes:", error);
      res.status(500).json({ message: "Error fetching recent price changes" });
    }
  });
  
  //
  // Price Alerts Routes
  //
  
  // Get all active price alerts
  app.get(`${apiPrefix}/alerts`, async (req: Request, res: Response) => {
    try {
      const alerts = await storage.getPriceAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Error fetching price alerts" });
    }
  });
  
  // Get a single price alert by ID
  app.get(`${apiPrefix}/alerts/:id`, async (req: Request, res: Response) => {
    try {
      const alert = await storage.getPriceAlertById(parseInt(req.params.id));
      
      if (!alert) {
        return res.status(404).json({ message: "Price alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Error fetching price alert:", error);
      res.status(500).json({ message: "Error fetching price alert" });
    }
  });
  
  // Create a new price alert
  app.post(`${apiPrefix}/alerts`, async (req: Request, res: Response) => {
    try {
      const validatedData = priceAlertsInsertSchema.parse(req.body);
      const newAlert = await storage.createPriceAlert(validatedData);
      res.status(201).json(newAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating price alert:", error);
      res.status(500).json({ message: "Error creating price alert" });
    }
  });
  
  // Update an existing price alert
  app.put(`${apiPrefix}/alerts/:id`, async (req: Request, res: Response) => {
    try {
      const validatedData = priceAlertsInsertSchema.partial().parse(req.body);
      const updatedAlert = await storage.updatePriceAlert(parseInt(req.params.id), validatedData);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Price alert not found" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating price alert:", error);
      res.status(500).json({ message: "Error updating price alert" });
    }
  });
  
  // Delete a price alert
  app.delete(`${apiPrefix}/alerts/:id`, async (req: Request, res: Response) => {
    try {
      await storage.deletePriceAlert(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting price alert:", error);
      res.status(500).json({ message: "Error deleting price alert" });
    }
  });
  
  //
  // Notification Logs Routes
  //
  
  // Get notification logs
  app.get(`${apiPrefix}/notification-logs`, async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = await storage.getNotificationLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching notification logs:", error);
      res.status(500).json({ message: "Error fetching notification logs" });
    }
  });
  
  //
  // Investments Routes
  //
  
  // Get all investments
  app.get(`${apiPrefix}/investments`, async (req: Request, res: Response) => {
    try {
      const investments = await storage.getInvestments();
      res.json(investments);
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ message: "Error fetching investments" });
    }
  });
  
  // Create a new investment
  app.post(`${apiPrefix}/investments`, async (req: Request, res: Response) => {
    try {
      const validatedData = investmentsInsertSchema.parse(req.body);
      const newInvestment = await storage.createInvestment(validatedData);
      res.status(201).json(newInvestment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error creating investment:", error);
      res.status(500).json({ message: "Error creating investment" });
    }
  });
  
  // Update an existing investment
  app.put(`${apiPrefix}/investments/:id`, async (req: Request, res: Response) => {
    try {
      const validatedData = investmentsInsertSchema.partial().parse(req.body);
      const updatedInvestment = await storage.updateInvestment(parseInt(req.params.id), validatedData);
      
      if (!updatedInvestment) {
        return res.status(404).json({ message: "Investment not found" });
      }
      
      res.json(updatedInvestment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      console.error("Error updating investment:", error);
      res.status(500).json({ message: "Error updating investment" });
    }
  });
  
  // Delete an investment
  app.delete(`${apiPrefix}/investments/:id`, async (req: Request, res: Response) => {
    try {
      await storage.deleteInvestment(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting investment:", error);
      res.status(500).json({ message: "Error deleting investment" });
    }
  });
  
  return httpServer;
}
