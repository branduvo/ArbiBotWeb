import { 
  type User, 
  type InsertUser, 
  type Exchange,
  type InsertExchange,
  type TradingPair,
  type InsertTradingPair,
  type Price,
  type InsertPrice,
  type ArbitrageOpportunity,
  type InsertArbitrageOpportunity,
  type Trade,
  type InsertTrade,
  type BotSettings,
  type InsertBotSettings,
  type PriceWithExchange,
  type ArbitrageOpportunityWithDetails,
  type TradeWithDetails
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Exchange methods
  getAllExchanges(): Promise<Exchange[]>;
  getActiveExchanges(): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchange(id: string, exchange: Partial<InsertExchange>): Promise<Exchange | undefined>;

  // Trading pair methods
  getAllTradingPairs(): Promise<TradingPair[]>;
  getActiveTradingPairs(): Promise<TradingPair[]>;
  createTradingPair(pair: InsertTradingPair): Promise<TradingPair>;
  updateTradingPair(id: string, pair: Partial<InsertTradingPair>): Promise<TradingPair | undefined>;

  // Price methods
  getLatestPrices(): Promise<PriceWithExchange[]>;
  getPricesByPair(tradingPairId: string): Promise<PriceWithExchange[]>;
  createPrice(price: InsertPrice): Promise<Price>;
  updatePrice(id: string, price: Partial<InsertPrice>): Promise<Price | undefined>;

  // Arbitrage opportunity methods
  getActiveOpportunities(): Promise<ArbitrageOpportunityWithDetails[]>;
  createOpportunity(opportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity>;
  updateOpportunity(id: string, opportunity: Partial<InsertArbitrageOpportunity>): Promise<ArbitrageOpportunity | undefined>;
  deactivateExpiredOpportunities(): Promise<void>;

  // Trade methods
  getAllTrades(): Promise<TradeWithDetails[]>;
  getRecentTrades(limit?: number): Promise<TradeWithDetails[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: string, trade: Partial<InsertTrade>): Promise<Trade | undefined>;

  // Bot settings methods
  getBotSettings(): Promise<BotSettings | undefined>;
  createOrUpdateBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private exchanges: Map<string, Exchange> = new Map();
  private tradingPairs: Map<string, TradingPair> = new Map();
  private prices: Map<string, Price> = new Map();
  private opportunities: Map<string, ArbitrageOpportunity> = new Map();
  private trades: Map<string, Trade> = new Map();
  private botSettings: BotSettings | undefined = undefined;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default exchanges
    const binanceId = randomUUID();
    const coinbaseId = randomUUID();
    const krakenId = randomUUID();
    const uniswapId = randomUUID();

    this.exchanges.set(binanceId, {
      id: binanceId,
      name: "Binance",
      isActive: true,
      apiKey: null,
      apiSecret: null,
      createdAt: new Date(),
    });

    this.exchanges.set(coinbaseId, {
      id: coinbaseId,
      name: "Coinbase Pro",
      isActive: true,
      apiKey: null,
      apiSecret: null,
      createdAt: new Date(),
    });

    this.exchanges.set(krakenId, {
      id: krakenId,
      name: "Kraken",
      isActive: true,
      apiKey: null,
      apiSecret: null,
      createdAt: new Date(),
    });

    this.exchanges.set(uniswapId, {
      id: uniswapId,
      name: "Uniswap V3",
      isActive: true,
      apiKey: null,
      apiSecret: null,
      createdAt: new Date(),
    });

    // Create default trading pairs
    const ethUsdtId = randomUUID();
    const btcUsdtId = randomUUID();
    const linkUsdtId = randomUUID();

    this.tradingPairs.set(ethUsdtId, {
      id: ethUsdtId,
      symbol: "ETH/USDT",
      baseAsset: "ETH",
      quoteAsset: "USDT",
      isActive: true,
    });

    this.tradingPairs.set(btcUsdtId, {
      id: btcUsdtId,
      symbol: "BTC/USDT",
      baseAsset: "BTC",
      quoteAsset: "USDT",
      isActive: true,
    });

    this.tradingPairs.set(linkUsdtId, {
      id: linkUsdtId,
      symbol: "LINK/USDT",
      baseAsset: "LINK",
      quoteAsset: "USDT",
      isActive: true,
    });

    // Initialize default bot settings
    this.botSettings = {
      id: randomUUID(),
      minProfitMargin: "0.25",
      maxPositionSize: "5000",
      slippageTolerance: "0.5",
      gasLimit: 500000,
      stopLoss: "2.0",
      dailyLossLimit: "1000",
      autoPauseOnLoss: true,
      isActive: false,
      updatedAt: new Date(),
    };
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Exchange methods
  async getAllExchanges(): Promise<Exchange[]> {
    return Array.from(this.exchanges.values());
  }

  async getActiveExchanges(): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(exchange => exchange.isActive);
  }

  async createExchange(insertExchange: InsertExchange): Promise<Exchange> {
    const id = randomUUID();
    const exchange: Exchange = {
      ...insertExchange,
      id,
      apiKey: insertExchange.apiKey ?? null,
      apiSecret: insertExchange.apiSecret ?? null,
      isActive: insertExchange.isActive ?? true,
      createdAt: new Date(),
    };
    this.exchanges.set(id, exchange);
    return exchange;
  }

  async updateExchange(id: string, exchange: Partial<InsertExchange>): Promise<Exchange | undefined> {
    const existing = this.exchanges.get(id);
    if (!existing) return undefined;
    
    const updated: Exchange = { ...existing, ...exchange };
    this.exchanges.set(id, updated);
    return updated;
  }

  // Trading pair methods
  async getAllTradingPairs(): Promise<TradingPair[]> {
    return Array.from(this.tradingPairs.values());
  }

  async getActiveTradingPairs(): Promise<TradingPair[]> {
    return Array.from(this.tradingPairs.values()).filter(pair => pair.isActive);
  }

  async createTradingPair(insertPair: InsertTradingPair): Promise<TradingPair> {
    const id = randomUUID();
    const pair: TradingPair = { 
      ...insertPair, 
      id, 
      isActive: insertPair.isActive ?? true 
    };
    this.tradingPairs.set(id, pair);
    return pair;
  }

  async updateTradingPair(id: string, pair: Partial<InsertTradingPair>): Promise<TradingPair | undefined> {
    const existing = this.tradingPairs.get(id);
    if (!existing) return undefined;
    
    const updated: TradingPair = { ...existing, ...pair };
    this.tradingPairs.set(id, updated);
    return updated;
  }

  // Price methods
  async getLatestPrices(): Promise<PriceWithExchange[]> {
    return Array.from(this.prices.values()).map(price => ({
      ...price,
      exchange: this.exchanges.get(price.exchangeId)!,
      tradingPair: this.tradingPairs.get(price.tradingPairId)!,
    }));
  }

  async getPricesByPair(tradingPairId: string): Promise<PriceWithExchange[]> {
    return Array.from(this.prices.values())
      .filter(price => price.tradingPairId === tradingPairId)
      .map(price => ({
        ...price,
        exchange: this.exchanges.get(price.exchangeId)!,
        tradingPair: this.tradingPairs.get(price.tradingPairId)!,
      }));
  }

  async createPrice(insertPrice: InsertPrice): Promise<Price> {
    const id = randomUUID();
    const price: Price = {
      ...insertPrice,
      id,
      change24h: insertPrice.change24h ?? null,
      timestamp: new Date(),
    };
    this.prices.set(id, price);
    return price;
  }

  async updatePrice(id: string, price: Partial<InsertPrice>): Promise<Price | undefined> {
    const existing = this.prices.get(id);
    if (!existing) return undefined;
    
    const updated: Price = { ...existing, ...price };
    this.prices.set(id, updated);
    return updated;
  }

  // Arbitrage opportunity methods
  async getActiveOpportunities(): Promise<ArbitrageOpportunityWithDetails[]> {
    return Array.from(this.opportunities.values())
      .filter(opp => opp.isActive)
      .map(opp => ({
        ...opp,
        tradingPair: this.tradingPairs.get(opp.tradingPairId)!,
        buyExchange: this.exchanges.get(opp.buyExchangeId)!,
        sellExchange: this.exchanges.get(opp.sellExchangeId)!,
      }));
  }

  async createOpportunity(insertOpportunity: InsertArbitrageOpportunity): Promise<ArbitrageOpportunity> {
    const id = randomUUID();
    const opportunity: ArbitrageOpportunity = {
      ...insertOpportunity,
      id,
      isActive: insertOpportunity.isActive ?? true,
      createdAt: new Date(),
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async updateOpportunity(id: string, opportunity: Partial<InsertArbitrageOpportunity>): Promise<ArbitrageOpportunity | undefined> {
    const existing = this.opportunities.get(id);
    if (!existing) return undefined;
    
    const updated: ArbitrageOpportunity = { ...existing, ...opportunity };
    this.opportunities.set(id, updated);
    return updated;
  }

  async deactivateExpiredOpportunities(): Promise<void> {
    const now = new Date();
    const expireTime = 30000; // 30 seconds
    
    for (const [id, opportunity] of Array.from(this.opportunities.entries())) {
      if (opportunity.isActive && (now.getTime() - opportunity.createdAt.getTime()) > expireTime) {
        opportunity.isActive = false;
        this.opportunities.set(id, opportunity);
      }
    }
  }

  // Trade methods
  async getAllTrades(): Promise<TradeWithDetails[]> {
    return Array.from(this.trades.values()).map(trade => ({
      ...trade,
      tradingPair: this.tradingPairs.get(trade.tradingPairId)!,
      buyExchange: this.exchanges.get(trade.buyExchangeId)!,
      sellExchange: this.exchanges.get(trade.sellExchangeId)!,
    }));
  }

  async getRecentTrades(limit: number = 10): Promise<TradeWithDetails[]> {
    return Array.from(this.trades.values())
      .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
      .slice(0, limit)
      .map(trade => ({
        ...trade,
        tradingPair: this.tradingPairs.get(trade.tradingPairId)!,
        buyExchange: this.exchanges.get(trade.buyExchangeId)!,
        sellExchange: this.exchanges.get(trade.sellExchangeId)!,
      }));
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = randomUUID();
    const trade: Trade = {
      ...insertTrade,
      id,
      opportunityId: insertTrade.opportunityId ?? null,
      executedAt: new Date(),
    };
    this.trades.set(id, trade);
    return trade;
  }

  async updateTrade(id: string, trade: Partial<InsertTrade>): Promise<Trade | undefined> {
    const existing = this.trades.get(id);
    if (!existing) return undefined;
    
    const updated: Trade = { ...existing, ...trade };
    this.trades.set(id, updated);
    return updated;
  }

  // Bot settings methods
  async getBotSettings(): Promise<BotSettings | undefined> {
    return this.botSettings;
  }

  async createOrUpdateBotSettings(settings: InsertBotSettings): Promise<BotSettings> {
    if (this.botSettings) {
      this.botSettings = {
        ...this.botSettings,
        ...settings,
        updatedAt: new Date(),
      };
    } else {
      this.botSettings = {
        ...settings,
        id: randomUUID(),
        isActive: settings.isActive ?? true,
        minProfitMargin: settings.minProfitMargin ?? "0.5",
        maxPositionSize: settings.maxPositionSize ?? "1000",
        slippageTolerance: settings.slippageTolerance ?? "0.1",
        gasLimit: settings.gasLimit ?? 21000,
        stopLoss: settings.stopLoss ?? "5.0",
        dailyLossLimit: settings.dailyLossLimit ?? "100",
        autoPauseOnLoss: settings.autoPauseOnLoss ?? false,
        updatedAt: new Date(),
      };
    }
    return this.botSettings!;
  }
}

export const storage = new MemStorage();
