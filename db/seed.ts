import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Check if gold prices already exist
    const existingPrices = await db.select().from(schema.goldPrices).limit(1);
    
    if (existingPrices.length === 0) {
      // Seed sample gold price data
      const currentDate = new Date();
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const twoDaysAgo = new Date(currentDate);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      // Insert sample gold prices
      await db.insert(schema.goldPrices).values([
        {
          date: currentDate,
          buyPrice: "1058000",
          sellPrice: "967000",
          pricePerGram: "1053000", 
          source: "pegadaian",
          highPrice: "1059500",
          lowPrice: "1052000"
        },
        {
          date: yesterday,
          buyPrice: "1050500",
          sellPrice: "970000",
          pricePerGram: "1045000",
          source: "pegadaian",
          highPrice: "1050500",
          lowPrice: "1040000"
        },
        {
          date: twoDaysAgo,
          buyPrice: "1045000",
          sellPrice: "968000",
          pricePerGram: "1042500",
          source: "pegadaian",
          highPrice: "1048000",
          lowPrice: "1040000"
        }
      ]);

      console.log("Seeded gold price data successfully");
    } else {
      console.log("Gold price data already exists, skipping seed");
    }

    // Check if price alerts already exist
    const existingAlerts = await db.select().from(schema.priceAlerts).limit(1);
    
    if (existingAlerts.length === 0) {
      // Seed sample price alerts
      await db.insert(schema.priceAlerts).values([
        {
          alertType: "increase",
          targetPrice: "1060000",
          whatsappEnabled: true,
          telegramEnabled: false,
          phoneNumber: "+6281224942994",
          active: true
        },
        {
          alertType: "decrease",
          targetPrice: "1000000",
          whatsappEnabled: false,
          telegramEnabled: true,
          telegramChatId: "123456789",
          active: true
        },
        {
          alertType: "daily",
          whatsappEnabled: true,
          telegramEnabled: true,
          phoneNumber: "+6281224942994",
          telegramChatId: "123456789",
          dailyTime: "20:00",
          active: true
        }
      ]);
      
      console.log("Seeded price alerts successfully");
    } else {
      console.log("Price alerts already exist, skipping seed");
    }

    // Check if investments already exist
    const existingInvestments = await db.select().from(schema.investments).limit(1);
    
    if (existingInvestments.length === 0) {
      // Create dates for the investments
      const march15 = new Date("2023-03-15");
      const feb28 = new Date("2023-02-28");
      
      // Seed sample investments
      await db.insert(schema.investments).values([
        {
          purchaseDate: march15,
          weight: "2.0",
          purchasePrice: "2100000",
          purity: "0.999",
          notes: "First gold investment"
        },
        {
          purchaseDate: feb28,
          weight: "3.0",
          purchasePrice: "3150000",
          purity: "0.999",
          notes: "Second gold investment"
        }
      ]);
      
      console.log("Seeded investments successfully");
    } else {
      console.log("Investments already exist, skipping seed");
    }
    
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

seed();
