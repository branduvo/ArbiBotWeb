import { useState } from "react";
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Exchange {
  id: string;
  name: string;
}

interface TradingPair {
  id: string;
  symbol: string;
}

interface PriceWithExchange {
  id: string;
  exchangeId: string;
  price: string;
  volume: string;
  change24h: string;
  exchange: Exchange;
  tradingPair: TradingPair;
}

interface PriceMonitorProps {
  prices: PriceWithExchange[];
  tradingPairs: TradingPair[];
}

export function PriceMonitor({ prices, tradingPairs }: PriceMonitorProps) {
  const [selectedPair, setSelectedPair] = useState<string>(tradingPairs[0]?.symbol || "ETH/USDT");

  const filteredPrices = prices.filter(
    price => price.tradingPair?.symbol === selectedPair
  );

  const getExchangeIcon = (exchangeName: string) => {
    const firstLetter = exchangeName.charAt(0).toUpperCase();
    const colors = {
      'B': 'from-orange-500 to-yellow-500',
      'C': 'from-blue-500 to-purple-500',
      'K': 'from-green-500 to-teal-500',
      'U': 'from-red-500 to-pink-500',
    };
    return { letter: firstLetter, gradient: colors[firstLetter as keyof typeof colors] || 'from-gray-500 to-gray-600' };
  };

  const getOpportunityColor = (change: number) => {
    if (change > 0.1) return 'bg-profit-green/20 text-profit-green';
    if (change > 0) return 'bg-warning-orange/20 text-warning-orange';
    return 'bg-loss-red/20 text-loss-red';
  };

  return (
    <div className="lg:col-span-2 bg-trading-panel rounded-xl border border-gray-700" data-testid="price-monitor">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Live Price Monitoring</h3>
          <div className="flex items-center space-x-3">
            <Select value={selectedPair} onValueChange={setSelectedPair}>
              <SelectTrigger className="w-32 bg-trading-dark border-gray-600" data-testid="pair-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-trading-dark border-gray-600">
                {tradingPairs.map((pair) => (
                  <SelectItem key={pair.id} value={pair.symbol} data-testid={`pair-option-${pair.symbol}`}>
                    {pair.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-trading-dark"
              data-testid="refresh-prices"
            >
              <RefreshCw className="h-4 w-4 text-text-secondary" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="price-table">
            <thead>
              <tr className="text-left text-text-secondary text-sm border-b border-gray-700">
                <th className="pb-3">Exchange</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">24h Change</th>
                <th className="pb-3">Volume</th>
                <th className="pb-3">Opportunity</th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {filteredPrices.map((price, index) => {
                const icon = getExchangeIcon(price.exchange?.name || '');
                const change24h = parseFloat(price.change24h || '0');
                const priceValue = parseFloat(price.price);
                const avgPrice = filteredPrices.reduce((sum, p) => sum + parseFloat(p.price), 0) / filteredPrices.length;
                const opportunity = ((priceValue - avgPrice) / avgPrice) * 100;
                
                return (
                  <tr 
                    key={`${price.exchangeId}-${price.tradingPair?.id}-${index}`}
                    className="border-b border-gray-800 hover:bg-trading-dark/50"
                    data-testid={`price-row-${price.exchange?.name}`}
                  >
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${icon.gradient} rounded-full flex items-center justify-center`}>
                          <span className="text-xs font-bold">{icon.letter}</span>
                        </div>
                        <span className="font-medium">{price.exchange?.name}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-lg" data-testid={`price-${price.exchange?.name}`}>
                      ${parseFloat(price.price).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8
                      })}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1">
                        {change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-profit-green" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-loss-red" />
                        )}
                        <span 
                          className={`font-medium ${change24h >= 0 ? 'text-profit-green' : 'text-loss-red'}`}
                          data-testid={`change-${price.exchange?.name}`}
                        >
                          {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-text-secondary font-mono" data-testid={`volume-${price.exchange?.name}`}>
                      ${(parseFloat(price.volume) / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-4">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${getOpportunityColor(opportunity)}`}
                        data-testid={`opportunity-${price.exchange?.name}`}
                      >
                        {opportunity >= 0 ? '+' : ''}{opportunity.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredPrices.length === 0 && (
            <div className="text-center py-8 text-text-muted" data-testid="no-prices">
              No price data available for {selectedPair}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
