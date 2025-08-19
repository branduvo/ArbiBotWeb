import { storage } from '../storage';
import { InsertPrice } from '@shared/schema';

export class ExchangeService {
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPriceUpdates();
  }

  startPriceUpdates() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }

    // Update prices every 2 seconds
    this.priceUpdateInterval = setInterval(async () => {
      await this.updateAllPrices();
    }, 2000);
  }

  stopPriceUpdates() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
      this.priceUpdateInterval = null;
    }
  }

  private async updateAllPrices() {
    try {
      const exchanges = await storage.getActiveExchanges();
      const pairs = await storage.getActiveTradingPairs();

      for (const exchange of exchanges) {
        for (const pair of pairs) {
          const price = this.generateMockPrice(exchange.name, pair.symbol);
          const priceData: InsertPrice = {
            exchangeId: exchange.id,
            tradingPairId: pair.id,
            price: price.price,
            volume: price.volume,
            change24h: price.change24h,
          };

          // Check if price already exists for this exchange/pair
          const existingPrices = await storage.getPricesByPair(pair.id);
          const existingPrice = existingPrices.find(p => p.exchangeId === exchange.id);

          if (existingPrice) {
            await storage.updatePrice(existingPrice.id, priceData);
          } else {
            await storage.createPrice(priceData);
          }
        }
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  private generateMockPrice(exchangeName: string, symbol: string) {
    // Base prices for different symbols
    const basePrices: Record<string, number> = {
      'ETH/USDT': 2845,
      'BTC/USDT': 43150,
      'LINK/USDT': 14.68,
    };

    // Exchange-specific price variations
    const exchangeVariations: Record<string, number> = {
      'Binance': 1.0,
      'Coinbase Pro': 0.9995,
      'Kraken': 1.0008,
      'Uniswap V3': 0.9992,
    };

    const basePrice = basePrices[symbol] || 100;
    const exchangeMultiplier = exchangeVariations[exchangeName] || 1.0;
    
    // Add some random variation (±0.1%)
    const randomVariation = 1 + (Math.random() - 0.5) * 0.002;
    
    const price = basePrice * exchangeMultiplier * randomVariation;
    
    // Generate volume based on exchange popularity
    const volumeMultipliers: Record<string, number> = {
      'Binance': 125000000,
      'Coinbase Pro': 98000000,
      'Kraken': 67000000,
      'Uniswap V3': 45000000,
    };
    
    const volume = (volumeMultipliers[exchangeName] || 50000000) * (0.8 + Math.random() * 0.4);
    
    // Generate 24h change (±5%)
    const change24h = (Math.random() - 0.5) * 10;

    return {
      price: price.toFixed(8),
      volume: volume.toFixed(8),
      change24h: change24h.toFixed(2),
    };
  }

  async getLatestPrices() {
    return await storage.getLatestPrices();
  }

  async getPricesByPair(tradingPairId: string) {
    return await storage.getPricesByPair(tradingPairId);
  }
}

export const exchangeService = new ExchangeService();
