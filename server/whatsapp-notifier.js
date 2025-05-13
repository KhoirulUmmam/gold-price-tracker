import whatsappWeb from 'whatsapp-web.js';
const { Client, LocalAuth } = whatsappWeb;
import qrcode from 'qrcode-terminal';
import { storage } from './storage.js';

export class WhatsAppNotifier {
  constructor() {
    this.clientInitialized = false;
    this.clientReady = false;
    this.initializeClient();
  }
  
  /**
   * Initialize the WhatsApp client
   */
  async initializeClient() {
    try {
      if (this.clientInitialized) return;
      
      // Create a client
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
      });
      
      // Set up event listeners
      this.client.on('qr', (qr) => {
        // Generate and show QR code for WhatsApp Web authentication
        console.log('Scan this QR code with WhatsApp to log in:');
        qrcode.generate(qr, { small: true });
      });
      
      this.client.on('ready', () => {
        console.log('WhatsApp client is ready');
        this.clientReady = true;
      });
      
      this.client.on('authenticated', () => {
        console.log('WhatsApp client authenticated');
      });
      
      this.client.on('auth_failure', (msg) => {
        console.error('WhatsApp authentication failed:', msg);
      });
      
      // Initialize
      this.clientInitialized = true;
      await this.client.initialize();
    } catch (error) {
      console.error('Error initializing WhatsApp client:', error.message);
      this.clientInitialized = false;
    }
  }
  
  /**
   * Send a WhatsApp message
   */
  async sendMessage(phoneNumber, message) {
    try {
      // Make sure client is initialized and ready
      if (!this.clientInitialized) {
        await this.initializeClient();
      }
      
      if (!this.clientReady) {
        throw new Error('WhatsApp client not ready. Please scan the QR code to authenticate.');
      }
      
      // Format phone number (remove any spaces or special characters)
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      
      // In WhatsApp-web.js, the phone number should include the country code without "+"
      const chatId = `${formattedNumber}@c.us`;
      
      // Send the message
      const result = await this.client.sendMessage(chatId, message);
      
      // Log the notification
      await storage.createNotificationLog({
        channel: 'whatsapp',
        message,
        status: 'sent',
        sentAt: new Date()
      });
      
      return result;
    } catch (error) {
      console.error(`Error sending WhatsApp message to ${phoneNumber}:`, error.message);
      
      // Log the failed notification
      await storage.createNotificationLog({
        channel: 'whatsapp',
        message,
        status: 'failed',
        errorMessage: error.message,
        sentAt: new Date()
      });
      
      throw error;
    }
  }
  
  /**
   * Send a price alert notification via WhatsApp
   */
  async sendPriceAlert(alert, currentPrice) {
    try {
      // Check if WhatsApp is enabled for this alert
      if (!alert.whatsappEnabled || !alert.phoneNumber) {
        console.log('WhatsApp not enabled for this alert');
        return false;
      }
      
      let message = '';
      const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(currentPrice.pricePerGram);
      
      if (alert.alertType === 'increase') {
        message = `🔔 *Price Increase Alert*\n\nGold price has increased above your target of ${formattedPrice}.\n\nCurrent price: ${formattedPrice}`;
      } else if (alert.alertType === 'decrease') {
        message = `🔔 *Price Decrease Alert*\n\nGold price has decreased below your target of ${formattedPrice}.\n\nCurrent price: ${formattedPrice}`;
      }
      
      if (message) {
        await this.sendMessage(alert.phoneNumber, message);
        
        // Update the alert's last triggered time
        await storage.updateAlertLastTriggered(alert.id);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error sending WhatsApp price alert:', error.message);
      throw error;
    }
  }
  
  /**
   * Send a daily summary via WhatsApp
   */
  async sendDailySummary(alert, priceData) {
    try {
      // Check if WhatsApp is enabled for this alert
      if (!alert.whatsappEnabled || !alert.phoneNumber) {
        console.log('WhatsApp not enabled for this daily summary');
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
      const message = `📊 *Daily Gold Price Summary*\n\n` +
        `Current Price: ${currentPrice} (${priceChangeStr})\n` +
        `Buy Price: ${buyPrice}\n` +
        `Sell Price: ${sellPrice}\n\n` +
        `_Data source: Pegadaian_`;
      
      await this.sendMessage(alert.phoneNumber, message);
      
      // Update the alert's last triggered time
      await storage.updateAlertLastTriggered(alert.id);
      
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp daily summary:', error.message);
      throw error;
    }
  }
}

// Create a singleton instance
export const whatsAppNotifier = new WhatsAppNotifier();
