import { pgTable, serial, text, integer, timestamp} from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

export const productAlert = pgTable("product_alerts", {
  id: serial("id").primaryKey(),

  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  productUrl: text("product_url").notNull(),

  currentPrice: integer("current_price").notNull(),
  targetPrice: integer("target_price").notNull(),
  
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  isActive: integer("is_active").notNull().default(1),
  triggeredAt: timestamp("triggered_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const historyPrice = pgTable("history_prices", {
  id: serial("id").primaryKey(),

  productAlertId: integer("product_alert_id")
    .notNull()
    .references(() => productAlert.id, { onDelete: "cascade" }),

  price: integer("price").notNull(),

  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});