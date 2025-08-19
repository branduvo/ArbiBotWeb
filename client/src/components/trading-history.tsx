import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradeWithDetails {
  id: string;
  tradingPairId: string;
  buyExchangeId: string;
  sellExchangeId: string;
  profit: string;
  status: string;
  executedAt: string;
  tradingPair: {
    symbol: string;
  };
  buyExchange: {
    name: string;
  };
  sellExchange: {
    name: string;
  };
}

interface TradingHistoryProps {
  trades: TradeWithDetails[];
  onViewAll?: () => void;
}

export function TradingHistory({ trades, onViewAll }: TradingHistoryProps) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-profit-green';
      case 'failed':
        return 'bg-loss-red';
      default:
        return 'bg-warning-orange';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-profit-green';
      case 'failed':
        return 'bg-loss-red';
      default:
        return 'bg-warning-orange';
    }
  };

  const recentTrades = trades.slice(0, 10).filter(trade => trade.status === 'completed');

  return (
    <div className="bg-trading-panel rounded-xl border border-gray-700" data-testid="trading-history">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Recent Trades</h3>
          <Button
            variant="ghost"
            size="sm"
            className="text-info-blue hover:text-blue-400"
            onClick={onViewAll}
            data-testid="view-all-trades"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto" data-testid="trades-list">
          {recentTrades.length > 0 ? (
            recentTrades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between p-3 bg-trading-dark rounded-lg"
                data-testid={`trade-${trade.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${getStatusIcon(trade.status)} rounded-full`} />
                  <div>
                    <p className="font-medium" data-testid={`trade-pair-${trade.id}`}>
                      {trade.tradingPair.symbol}
                    </p>
                    <p className="text-xs text-text-muted" data-testid={`trade-route-${trade.id}`}>
                      {trade.buyExchange.name} → {trade.sellExchange.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p 
                    className={`font-mono font-medium ${
                      parseFloat(trade.profit) >= 0 ? 'text-profit-green' : 'text-loss-red'
                    }`}
                    data-testid={`trade-profit-${trade.id}`}
                  >
                    {parseFloat(trade.profit) >= 0 ? '+' : ''}${parseFloat(trade.profit).toFixed(2)}
                  </p>
                  <p className="text-xs text-text-muted" data-testid={`trade-time-${trade.id}`}>
                    {getTimeAgo(trade.executedAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-muted" data-testid="no-trades">
              <p>No trades executed yet</p>
              <p className="text-sm mt-2">Completed trades will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
