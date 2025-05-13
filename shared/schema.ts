import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Gold Price Table
export const goldPrices = pgTable("gold_prices", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  buyPrice: decimal("buy_price", { precision: 10, scale: 2 }).notNull(),
  sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).notNull(),
  pricePerGram: decimal("price_per_gram", { precision: 10, scale: 2 }).notNull(),
  source: text("source").default("pegadaian").notNull(),
  highPrice: decimal("high_price", { precision: 10, scale: 2 }),
  lowPrice: decimal("low_price", { precision: 10, scale: 2 }),
});

// Price Notifications Table
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  alertType: text("alert_type").notNull(), // 'increase', 'decrease', 'daily'
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }),
  whatsappEnabled: boolean("whatsapp_enabled").default(false),
  telegramEnabled: boolean("telegram_enabled").default(false),
  phoneNumber: text("phone_number"),
  telegramChatId: text("telegram_chat_id"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastTriggered: timestamp("last_triggered"),
  dailyTime: text("daily_time"), // For daily summary alerts, e.g., '20:00'
});

// User Investments Table
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  purchaseDate: timestamp("purchase_date").notNull(),
  weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull(),
  purity: decimal("purity", { precision: 5, scale: 3 }).notNull().default("0.999"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification Logs Table
export const notificationLogs = pgTable("notification_logs", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => priceAlerts.id),
  channel: text("channel").notNull(), // 'whatsapp', 'telegram'
  message: text("message").notNull(),
  status: text("status").notNull(), // 'sent', 'failed'
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

// Schemas
export const goldPricesInsertSchema = createInsertSchema(goldPrices);
export const goldPricesSelectSchema = createSelectSchema(goldPrices);
export type GoldPrice = z.infer<typeof goldPricesSelectSchema>;
export type GoldPriceInsert = z.infer<typeof goldPricesInsertSchema>;

export const priceAlertsInsertSchema = createInsertSchema(priceAlerts);
export const priceAlertsSelectSchema = createSelectSchema(priceAlerts);
export type PriceAlert = z.infer<typeof priceAlertsSelectSchema>;
export type PriceAlertInsert = z.infer<typeof priceAlertsInsertSchema>;

export const investmentsInsertSchema = createInsertSchema(investments);
export const investmentsSelectSchema = createSelectSchema(investments);
export type Investment = z.infer<typeof investmentsSelectSchema>;
export type InvestmentInsert = z.infer<typeof investmentsInsertSchema>;

export const notificationLogsInsertSchema = createInsertSchema(notificationLogs);
export const notificationLogsSelectSchema = createSelectSchema(notificationLogs);
export type NotificationLog = z.infer<typeof notificationLogsSelectSchema>;
export type NotificationLogInsert = z.infer<typeof notificationLogsInsertSchema>;
