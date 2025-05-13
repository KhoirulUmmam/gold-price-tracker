import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage.js';

export class TelegramNotifier {
  constructor() {
    // Get Telegram Bot token from environment variables
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    
    // Initialize the bot if we have a token
    if (this.token) {
      this.bot = new TelegramBot(this.token, { polling: false });
      console.log('Telegram Bot initialized');
    } else {
      console.warn('TELEGRAM_BOT_TOKEN not found in environment variables. Telegram notifications will not work.');
    }
  }
  
  /**
   * Send a notification to a specific Telegram chat
   */
  async sendNotification(chatId, message) {
    try {
      // Check if the bot is initialized
      if (!this.bot) {
        throw new Error('Telegram Bot not initialized. Check TELEGRAM_BOT_TOKEN environment variable.');
      }
      
      // Make sure we have a chat ID
      if (!chatId) {
        throw new Error('Chat ID is required to send a Telegram notification');
      }
      
      // Send the message
      const result = await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
      
      // Log the notification
      await storage.createNotificationLog({
        channel: 'telegram',
        message,
        status: 'sent',
        sentAt: new Date()
      });
      
      return result;
    } catch (error) {
      console.error(`Error sending Telegram notification to ${chatId}:`, error.message);
      
      // Log the failed notification
      await storage.createNotificationLog({
        channel: 'telegram',
        message,
        status: 'failed',
        errorMessage: error.message,
        sentAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Send a price alert notification
   */
  async sendPriceAlert(alert, currentPrice) {
    try {
      // Check if Telegram is enabled for this alert
      if (!alert.telegramEnabled || !alert.telegramChatId) {
        console.log('Telegram not enabled for this alert');
        return false;
      }
      
      let message = '';
      const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(currentPrice.pricePerGram);
      
      if (alert.alertType === 'increase') {
        message = `🔔 <b>Price Increase Alert</b>\n\nGold price has increased above your target of ${formattedPrice}.\n\nCurrent price: ${formattedPrice}`;
      } else if (alert.alertType === 'decrease') {
        message = `🔔 <b>Price Decrease Alert</b>\n\nGold price has decreased below your target of ${formattedPrice}.\n\nCurrent price: ${formattedPrice}`;
      }
      
      if (message) {
        await this.sendNotification(alert.telegramChatId, message);
        
        // Update the alert's last triggered time
        await storage.updateAlertLastTriggered(alert.id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending Telegram price alert:', error.message);
      throw error;
    }
  }
  
  /**
   * Send a daily summary
   */
  async sendDailySummary(alert, priceData) {
    try {
      // Check if Telegram is enabled for this alert
      if (!alert.telegramEnabled || !alert.telegramChatId) {
        console.log('Telegram not enabled for this daily summary');
        return false;
      }
      
      // Format the prices
      const currentPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(priceData.pricePerGram);
      
      const buyPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(priceData.buyPrice);
      
      const sellPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(priceData.sellPrice);
      
      // Format changes
      const priceChange = priceData.priceChange || 0;
      const priceChangeStr = priceChange >= 0 
        ? `+${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(priceChange)}`
        : `${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(priceChange)}`;
      
      // Create the message
      const message = `📊 <b>Daily Gold Price Summary</b>\n\n` +
        `Current Price: ${currentPrice} (${priceChangeStr})\n` +
        `Buy Price: ${buyPrice}\n` +
        `Sell Price: ${sellPrice}\n\n` +
        `<i>Data source: Pegadaian</i>`;
      
      await this.sendNotification(alert.telegramChatId, message);
      
      // Update the alert's last triggered time
      await storage.updateAlertLastTriggered(alert.id);
      
      return true;
    } catch (error) {
      console.error('Error sending Telegram daily summary:', error.message);
      throw error;
    }
  }
}

// Create a singleton instance
export const telegramNotifier = new TelegramNotifier();
