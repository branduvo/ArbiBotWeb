import { storage } from '../storage';
import { exchangeService } from './exchanges';
import { InsertArbitrageOpportunity } from '@shared/schema';

export class ArbitrageService {
  private scanInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startScanning();
  }

  startScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }

    // Scan for opportunities every 5 seconds
    this.scanInterval = setInterval(async () => {
      await this.scanForOpportunities();
      await this.cleanupExpiredOpportunities();
    }, 5000);
  }

  stopScanning() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  private async scanForOpportunities() {
    try {
      const pairs = await storage.getActiveTradingPairs();
      const botSettings = await storage.getBotSettings();
      
      if (!botSettings) return;

      const minProfitMargin = parseFloat(botSettings.minProfitMargin);

      for (const pair of pairs) {
        const prices = await storage.getPricesByPair(pair.id);
        
        if (prices.length < 2) continue;

        // Find arbitrage opportunities
        for (let i = 0; i < prices.length; i++) {
          for (let j = i + 1; j < prices.length; j++) {
            const price1 = prices[i];
            const price2 = prices[j];
            
            const priceA = parseFloat(price1.price);
            const priceB = parseFloat(price2.price);
            
            let buyPrice, sellPrice, buyExchange, sellExchange;
            
            if (priceA < priceB) {
              buyPrice = priceA;
              sellPrice = priceB;
              buyExchange = price1.exchangeId;
              sellExchange = price2.exchangeId;
            } else {
              buyPrice = priceB;
              sellPrice = priceA;
              buyExchange = price2.exchangeId;
              sellExchange = price1.exchangeId;
            }

            const profitMargin = ((sellPrice - buyPrice) / buyPrice) * 100;
            
            if (profitMargin > minProfitMargin) {
              const maxPositionSize = parseFloat(botSettings.maxPositionSize);
              const potentialProfit = (sellPrice - buyPrice) * (maxPositionSize / buyPrice);
              
              const opportunity: InsertArbitrageOpportunity = {
                tradingPairId: pair.id,
                buyExchangeId: buyExchange,
                sellExchangeId: sellExchange,
                buyPrice: buyPrice.toFixed(8),
                sellPrice: sellPrice.toFixed(8),
                profitMargin: profitMargin.toFixed(4),
                potentialProfit: potentialProfit.toFixed(8),
                isActive: true,
              };

              // Check if similar opportunity already exists
              const existingOpportunities = await storage.getActiveOpportunities();
              const similarOpportunity = existingOpportunities.find(opp => 
                opp.tradingPairId === pair.id &&
                opp.buyExchangeId === buyExchange &&
                opp.sellExchangeId === sellExchange
              );

              if (similarOpportunity) {
                // Update existing opportunity
                await storage.updateOpportunity(similarOpportunity.id, opportunity);
              } else {
                // Create new opportunity
                await storage.createOpportunity(opportunity);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error scanning for arbitrage opportunities:', error);
    }
  }

  private async cleanupExpiredOpportunities() {
    await storage.deactivateExpiredOpportunities();
  }

  async getActiveOpportunities() {
    return await storage.getActiveOpportunities();
  }

  async executeArbitrage(opportunityId: string) {
    try {
      const opportunities = await storage.getActiveOpportunities();
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      
      if (!opportunity || !opportunity.isActive) {
        throw new Error('Opportunity not found or no longer active');
      }

      const botSettings = await storage.getBotSettings();
      if (!botSettings || !botSettings.isActive) {
        throw new Error('Bot is not active');
      }

      // Simulate trade execution
      const amount = parseFloat(botSettings.maxPositionSize) / parseFloat(opportunity.buyPrice);
      const profit = parseFloat(opportunity.potentialProfit);

      // Create trade record
      const trade = await storage.createTrade({
        opportunityId: opportunity.id,
        tradingPairId: opportunity.tradingPairId,
        buyExchangeId: opportunity.buyExchangeId,
        sellExchangeId: opportunity.sellExchangeId,
        buyPrice: opportunity.buyPrice,
        sellPrice: opportunity.sellPrice,
        amount: amount.toFixed(8),
        profit: profit.toFixed(8),
        status: 'completed',
      });

      // Deactivate the opportunity
      await storage.updateOpportunity(opportunityId, { isActive: false });

      return trade;
    } catch (error) {
      console.error('Error executing arbitrage:', error);
      throw error;
    }
  }
}

export const arbitrageService = new ArbitrageService();
