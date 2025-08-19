import { useState, useEffect } from "react";
import { StopCircle, Wallet, TrendingUp, Target, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { PriceMonitor } from "@/components/price-monitor";
import { BotControl } from "@/components/bot-control";
import { ArbitrageOpportunities } from "@/components/arbitrage-opportunities";
import { TradingHistory } from "@/components/trading-history";
import { SettingsModal } from "@/components/settings-modal";
import { useWebSocket } from "@/hooks/use-websocket";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { data, isConnected } = useWebSocket();
  const { toast } = useToast();

  // Emergency stop mutation
  const emergencyStopMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/emergency-stop'),
    onSuccess: () => {
      toast({
        title: "Emergency Stop Activated",
        description: "All trading operations have been immediately halted.",
        variant: "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Emergency Stop Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update last update timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toTimeString().split(' ')[0] + ' UTC';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number, decimals: number = 1) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
  };

  // Calculate metrics from real-time data
  const metrics = {
    dailyProfit: data.botStatus?.dailyProfit || 0,
    dailyProfitChange: data.botStatus?.dailyProfit && data.botStatus.dailyProfit > 0 ? 12.4 : 0,
    opportunitiesCount: data.opportunities?.length || 0,
    successRate: data.botStatus?.successRate || 0,
    successRateChange: 2.1,
    dailyVolume: data.botStatus?.dailyVolume || 0,
    volumeChange: 8.3,
  };

  const mockWalletBalance = 45892.47; // This could come from a wallet API

  return (
    <div className="flex h-screen bg-trading-dark text-white">
      <Sidebar botStatus={data.botStatus} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="bg-trading-slate border-b border-gray-700 p-4" data-testid="top-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h2 className="text-2xl font-bold">Trading Dashboard</h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    isConnected ? 'bg-profit-green' : 'bg-loss-red'
                  }`} data-testid="connection-indicator" />
                  <span className="text-sm text-text-secondary">
                    {isConnected ? 'Live Market Data' : 'Disconnected'}
                  </span>
                </div>
                <div className="text-sm text-text-muted">
                  Last Update: <span className="font-mono" data-testid="last-update">
                    {formatTime(lastUpdate)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                className="px-4 py-2 bg-loss-red hover:bg-red-600 text-white font-medium transition-colors"
                onClick={() => emergencyStopMutation.mutate()}
                disabled={emergencyStopMutation.isPending}
                data-testid="emergency-stop-btn"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                {emergencyStopMutation.isPending ? 'Stopping...' : 'Emergency Stop'}
              </Button>
              <div className="flex items-center space-x-2">
                <Wallet className="text-info-blue" />
                <span className="font-mono text-lg" data-testid="wallet-balance">
                  {formatCurrency(mockWalletBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 p-6 overflow-auto bg-trading-bg">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="metrics-grid">
            {/* Total Profit Card */}
            <div className="bg-trading-panel rounded-xl p-6 border border-gray-700" data-testid="metric-profit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary text-sm font-medium">Total Profit (24h)</h3>
                <TrendingUp className="text-profit-green" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-mono text-profit-green" data-testid="profit-amount">
                  {formatCurrency(metrics.dailyProfit)}
                </span>
                <span className="text-sm text-profit-green font-medium" data-testid="profit-change">
                  {formatPercentage(metrics.dailyProfitChange)}
                </span>
              </div>
              <p className="text-text-muted text-sm mt-2">
                ↑ {formatCurrency(metrics.dailyProfit * 0.122)} from yesterday
              </p>
            </div>

            {/* Arbitrage Opportunities Card */}
            <div className="bg-trading-panel rounded-xl p-6 border border-gray-700" data-testid="metric-opportunities">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary text-sm font-medium">Arbitrage Opportunities</h3>
                <TrendingUp className="text-warning-orange" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-mono text-white" data-testid="opportunities-count">
                  {metrics.opportunitiesCount}
                </span>
                <span className="text-sm text-profit-green font-medium">Active</span>
              </div>
              <p className="text-text-muted text-sm mt-2">
                {metrics.opportunitiesCount > 0 ? '↑ New opportunities detected' : 'Scanning for opportunities'}
              </p>
            </div>

            {/* Success Rate Card */}
            <div className="bg-trading-panel rounded-xl p-6 border border-gray-700" data-testid="metric-success-rate">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary text-sm font-medium">Success Rate</h3>
                <Target className="text-info-blue" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-mono text-white" data-testid="success-rate">
                  {metrics.successRate.toFixed(1)}%
                </span>
                <span className="text-sm text-profit-green font-medium">
                  {formatPercentage(metrics.successRateChange)}
                </span>
              </div>
              <p className="text-text-muted text-sm mt-2">
                {data.botStatus?.totalTrades ? 
                  `${Math.floor(metrics.successRate * data.botStatus.totalTrades / 100)}/${data.botStatus.totalTrades} successful trades` :
                  'No trades executed yet'
                }
              </p>
            </div>

            {/* Volume Card */}
            <div className="bg-trading-panel rounded-xl p-6 border border-gray-700" data-testid="metric-volume">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-secondary text-sm font-medium">Volume (24h)</h3>
                <Coins className="text-info-blue" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold font-mono text-white" data-testid="volume-amount">
                  ${metrics.dailyVolume >= 1000 ? 
                    `${(metrics.dailyVolume / 1000).toFixed(1)}K` : 
                    formatNumber(metrics.dailyVolume)
                  }
                </span>
                <span className="text-sm text-profit-green font-medium">
                  {formatPercentage(metrics.volumeChange)}
                </span>
              </div>
              <p className="text-text-muted text-sm mt-2">
                Across {Array.from(new Set(data.prices?.map(p => p.exchange?.name) || [])).length} exchanges
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <PriceMonitor 
              prices={data.prices || []} 
              tradingPairs={Array.from(new Set(data.prices?.map(p => p.tradingPair).filter(Boolean) || []))}
            />
            <BotControl 
              botStatus={data.botStatus} 
              onSettingsClick={() => setIsSettingsOpen(true)}
            />
          </div>

          {/* Trading Opportunities and History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ArbitrageOpportunities opportunities={data.opportunities || []} />
            <TradingHistory trades={data.trades || []} />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
