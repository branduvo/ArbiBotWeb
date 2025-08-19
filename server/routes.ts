import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { botService } from "./services/bot";
import { arbitrageService } from "./services/arbitrage";
import { exchangeService } from "./services/exchanges";
import { insertBotSettingsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bot control endpoints
  app.post("/api/bot/start", async (req, res) => {
    try {
      const status = await botService.startBot();
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/bot/pause", async (req, res) => {
    try {
      const status = await botService.pauseBot();
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/bot/stop", async (req, res) => {
    try {
      const status = await botService.stopBot();
      res.json(status);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  app.post("/api/bot/emergency-stop", async (req, res) => {
    try {
      const result = await botService.emergencyStop();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/bot/status", async (req, res) => {
    try {
      const status = await botService.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Bot settings endpoints
  app.get("/api/bot/settings", async (req, res) => {
    try {
      const settings = await botService.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/bot/settings", async (req, res) => {
    try {
      const validatedSettings = insertBotSettingsSchema.parse(req.body);
      const settings = await botService.updateSettings(validatedSettings);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Exchange and price endpoints
  app.get("/api/exchanges", async (req, res) => {
    try {
      const exchanges = await storage.getActiveExchanges();
      res.json(exchanges);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await exchangeService.getLatestPrices();
      res.json(prices);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/trading-pairs", async (req, res) => {
    try {
      const pairs = await storage.getActiveTradingPairs();
      res.json(pairs);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Arbitrage endpoints
  app.get("/api/opportunities", async (req, res) => {
    try {
      const opportunities = await arbitrageService.getActiveOpportunities();
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post("/api/opportunities/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const trade = await arbitrageService.executeArbitrage(id);
      res.json(trade);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  });

  // Trading history endpoints
  app.get("/api/trades", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const trades = await storage.getRecentTrades(limit);
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get("/api/trades/all", async (req, res) => {
    try {
      const trades = await storage.getAllTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    // Send initial data
    const sendInitialData = async () => {
      try {
        const [prices, opportunities, trades, botStatus] = await Promise.all([
          exchangeService.getLatestPrices(),
          arbitrageService.getActiveOpportunities(),
          storage.getRecentTrades(10),
          botService.getStatus()
        ]);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'initial',
            data: { prices, opportunities, trades, botStatus }
          }));
        }
      } catch (error) {
        console.error('Error sending initial data:', error);
      }
    };

    sendInitialData();

    // Send periodic updates
    const updateInterval = setInterval(async () => {
      try {
        const [prices, opportunities, trades, botStatus] = await Promise.all([
          exchangeService.getLatestPrices(),
          arbitrageService.getActiveOpportunities(),
          storage.getRecentTrades(10),
          botService.getStatus()
        ]);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'update',
            data: { prices, opportunities, trades, botStatus }
          }));
        }
      } catch (error) {
        console.error('Error sending update:', error);
      }
    }, 3000); // Update every 3 seconds

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clearInterval(updateInterval);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clearInterval(updateInterval);
    });
  });

  return httpServer;
}
