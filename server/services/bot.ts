import { storage } from '../storage';
import { arbitrageService } from './arbitrage';
import { exchangeService } from './exchanges';
import { InsertBotSettings } from '@shared/schema';

export interface BotStatus {
  isActive: boolean;
  status: 'running' | 'paused' | 'stopped';
  startTime: Date | null;
  totalProfit: number;
  tradesExecuted: number;
  activePairs: number;
}

export class BotService {
  private status: BotStatus = {
    isActive: false,
    status: 'stopped',
    startTime: null,
    totalProfit: 0,
    tradesExecuted: 0,
    activePairs: 0,
  };

  private autoExecuteInterval: NodeJS.Timeout | null = null;

  async startBot() {
    const settings = await storage.getBotSettings();
    if (!settings) {
      throw new Error('Bot settings not configured');
    }

    await storage.createOrUpdateBotSettings({
      ...settings,
      isActive: true,
    });

    this.status = {
      isActive: true,
      status: 'running',
      startTime: new Date(),
      totalProfit: 0,
      tradesExecuted: 0,
      activePairs: 0,
    };

    // Start auto-execution of profitable opportunities
    this.startAutoExecution();

    return this.status;
  }

  async pauseBot() {
    const settings = await storage.getBotSettings();
    if (settings) {
      await storage.createOrUpdateBotSettings({
        ...settings,
        isActive: false,
      });
    }

    this.status.status = 'paused';
    this.status.isActive = false;
    this.stopAutoExecution();

    return this.status;
  }

  async stopBot() {
    const settings = await storage.getBotSettings();
    if (settings) {
      await storage.createOrUpdateBotSettings({
        ...settings,
        isActive: false,
      });
    }

    this.status = {
      isActive: false,
      status: 'stopped',
      startTime: null,
      totalProfit: 0,
      tradesExecuted: 0,
      activePairs: 0,
    };

    this.stopAutoExecution();

    return this.status;
  }

  private startAutoExecution() {
    if (this.autoExecuteInterval) {
      clearInterval(this.autoExecuteInterval);
    }

    // Check for and execute opportunities every 10 seconds
    this.autoExecuteInterval = setInterval(async () => {
      await this.executeTopOpportunities();
    }, 10000);
  }

  private stopAutoExecution() {
    if (this.autoExecuteInterval) {
      clearInterval(this.autoExecuteInterval);
      this.autoExecuteInterval = null;
    }
  }

  private async executeTopOpportunities() {
    try {
      const opportunities = await arbitrageService.getActiveOpportunities();
      const settings = await storage.getBotSettings();

      if (!settings || !settings.isActive) return;

      // Sort opportunities by profit margin (highest first)
      const sortedOpportunities = opportunities
        .sort((a, b) => parseFloat(b.profitMargin) - parseFloat(a.profitMargin))
        .slice(0, 3); // Execute top 3 opportunities

      for (const opportunity of sortedOpportunities) {
        try {
          const trade = await arbitrageService.executeArbitrage(opportunity.id);
          this.status.tradesExecuted++;
          this.status.totalProfit += parseFloat(trade.profit);
        } catch (error) {
          console.error('Failed to execute opportunity:', opportunity.id, error);
        }
      }

      // Update active pairs count
      const activePairs = await storage.getActiveTradingPairs();
      this.status.activePairs = activePairs.length;
    } catch (error) {
      console.error('Error in auto-execution:', error);
    }
  }

  async getStatus() {
    // Update real-time stats
    const recentTrades = await storage.getRecentTrades(100);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrades = recentTrades.filter(trade => 
      trade.executedAt >= today && trade.status === 'completed'
    );

    const todayProfit = todayTrades.reduce((sum, trade) => 
      sum + parseFloat(trade.profit), 0
    );

    const totalVolume = todayTrades.reduce((sum, trade) => 
      sum + (parseFloat(trade.amount) * parseFloat(trade.buyPrice)), 0
    );

    const successfulTrades = recentTrades.filter(trade => 
      trade.status === 'completed' && parseFloat(trade.profit) > 0
    ).length;

    const successRate = recentTrades.length > 0 
      ? (successfulTrades / recentTrades.length) * 100 
      : 0;

    return {
      ...this.status,
      dailyProfit: todayProfit,
      dailyVolume: totalVolume,
      successRate,
      totalTrades: recentTrades.length,
    };
  }

  async updateSettings(settings: InsertBotSettings) {
    return await storage.createOrUpdateBotSettings(settings);
  }

  async getSettings() {
    return await storage.getBotSettings();
  }

  async emergencyStop() {
    // Immediately stop all operations
    await this.stopBot();
    
    // Deactivate all opportunities
    const opportunities = await arbitrageService.getActiveOpportunities();
    for (const opportunity of opportunities) {
      await storage.updateOpportunity(opportunity.id, { isActive: false });
    }

    return { message: 'Emergency stop executed successfully' };
  }
}

export const botService = new BotService();
