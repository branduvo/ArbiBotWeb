import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const exchanges = pgTable("exchanges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tradingPairs = pgTable("trading_pairs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull(), // e.g. "ETH/USDT"
  baseAsset: text("base_asset").notNull(), // e.g. "ETH"
  quoteAsset: text("quote_asset").notNull(), // e.g. "USDT"
  isActive: boolean("is_active").notNull().default(true),
});

export const prices = pgTable("prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  exchangeId: varchar("exchange_id").notNull().references(() => exchanges.id),
  tradingPairId: varchar("trading_pair_id").notNull().references(() => tradingPairs.id),
  price: decimal("price", { precision: 20, scale: 8 }).notNull(),
  volume: decimal("volume", { precision: 20, scale: 8 }).notNull(),
  change24h: decimal("change_24h", { precision: 10, scale: 4 }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const arbitrageOpportunities = pgTable("arbitrage_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradingPairId: varchar("trading_pair_id").notNull().references(() => tradingPairs.id),
  buyExchangeId: varchar("buy_exchange_id").notNull().references(() => exchanges.id),
  sellExchangeId: varchar("sell_exchange_id").notNull().references(() => exchanges.id),
  buyPrice: decimal("buy_price", { precision: 20, scale: 8 }).notNull(),
  sellPrice: decimal("sell_price", { precision: 20, scale: 8 }).notNull(),
  profitMargin: decimal("profit_margin", { precision: 10, scale: 4 }).notNull(),
  potentialProfit: decimal("potential_profit", { precision: 20, scale: 8 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  opportunityId: varchar("opportunity_id").references(() => arbitrageOpportunities.id),
  tradingPairId: varchar("trading_pair_id").notNull().references(() => tradingPairs.id),
  buyExchangeId: varchar("buy_exchange_id").notNull().references(() => exchanges.id),
  sellExchangeId: varchar("sell_exchange_id").notNull().references(() => exchanges.id),
  buyPrice: decimal("buy_price", { precision: 20, scale: 8 }).notNull(),
  sellPrice: decimal("sell_price", { precision: 20, scale: 8 }).notNull(),
  amount: decimal("amount", { precision: 20, scale: 8 }).notNull(),
  profit: decimal("profit", { precision: 20, scale: 8 }).notNull(),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  minProfitMargin: decimal("min_profit_margin", { precision: 10, scale: 4 }).notNull().default("0.25"),
  maxPositionSize: decimal("max_position_size", { precision: 20, scale: 8 }).notNull().default("5000"),
  slippageTolerance: decimal("slippage_tolerance", { precision: 10, scale: 4 }).notNull().default("0.5"),
  gasLimit: integer("gas_limit").notNull().default(500000),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 4 }).notNull().default("2.0"),
  dailyLossLimit: decimal("daily_loss_limit", { precision: 20, scale: 8 }).notNull().default("1000"),
  autoPauseOnLoss: boolean("auto_pause_on_loss").notNull().default(true),
  isActive: boolean("is_active").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertExchangeSchema = createInsertSchema(exchanges).omit({
  id: true,
  createdAt: true,
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs).omit({
  id: true,
});

export const insertPriceSchema = createInsertSchema(prices).omit({
  id: true,
  timestamp: true,
});

export const insertArbitrageOpportunitySchema = createInsertSchema(arbitrageOpportunities).omit({
  id: true,
  createdAt: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  executedAt: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Exchange = typeof exchanges.$inferSelect;
export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type TradingPair = typeof tradingPairs.$inferSelect;
export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type Price = typeof prices.$inferSelect;
export type InsertPrice = z.infer<typeof insertPriceSchema>;
export type ArbitrageOpportunity = typeof arbitrageOpportunities.$inferSelect;
export type InsertArbitrageOpportunity = z.infer<typeof insertArbitrageOpportunitySchema>;
export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type BotSettings = typeof botSettings.$inferSelect;
export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;

// Extended types for API responses
export type PriceWithExchange = Price & {
  exchange: Exchange;
  tradingPair: TradingPair;
};

export type ArbitrageOpportunityWithDetails = ArbitrageOpportunity & {
  tradingPair: TradingPair;
  buyExchange: Exchange;
  sellExchange: Exchange;
};

export type TradeWithDetails = Trade & {
  tradingPair: TradingPair;
  buyExchange: Exchange;
  sellExchange: Exchange;
};
