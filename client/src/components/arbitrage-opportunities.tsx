import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ArbitrageOpportunityWithDetails {
  id: string;
  tradingPairId: string;
  buyExchangeId: string;
  sellExchangeId: string;
  buyPrice: string;
  sellPrice: string;
  profitMargin: string;
  potentialProfit: string;
  isActive: boolean;
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

interface ArbitrageOpportunitiesProps {
  opportunities: ArbitrageOpportunityWithDetails[];
}

export function ArbitrageOpportunities({ opportunities }: ArbitrageOpportunitiesProps) {
  const { toast } = useToast();

  const executeOpportunityMutation = useMutation({
    mutationFn: (opportunityId: string) => apiRequest('POST', `/api/opportunities/${opportunityId}/execute`),
    onSuccess: () => {
      toast({
        title: "Trade Executed",
        description: "Arbitrage opportunity has been successfully executed.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/trades'] });
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getExchangeIcon = (exchangeName: string) => {
    const colors: Record<string, string> = {
      'Binance': 'bg-orange-500',
      'Coinbase Pro': 'bg-blue-500',
      'Kraken': 'bg-green-500',
      'Uniswap V3': 'bg-red-500',
    };
    return colors[exchangeName] || 'bg-gray-500';
  };

  const activeOpportunities = opportunities.filter(opp => opp.isActive);

  return (
    <div className="bg-trading-panel rounded-xl border border-gray-700" data-testid="arbitrage-opportunities">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Live Arbitrage Opportunities</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-profit-green rounded-full animate-pulse" data-testid="live-indicator" />
            <span className="text-sm text-text-muted" data-testid="opportunities-count">
              {activeOpportunities.length} Active
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto" data-testid="opportunities-list">
          {activeOpportunities.length > 0 ? (
            activeOpportunities
              .sort((a, b) => parseFloat(b.profitMargin) - parseFloat(a.profitMargin))
              .map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="p-4 bg-trading-dark rounded-lg border border-gray-700 hover:border-profit-green/50 transition-colors"
                  data-testid={`opportunity-${opportunity.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-2">
                        <div className={`w-6 h-6 ${getExchangeIcon(opportunity.buyExchange.name)} rounded-full border-2 border-trading-dark`} />
                        <div className={`w-6 h-6 ${getExchangeIcon(opportunity.sellExchange.name)} rounded-full border-2 border-trading-dark`} />
                      </div>
                      <div>
                        <p className="font-medium" data-testid={`opportunity-route-${opportunity.id}`}>
                          {opportunity.buyExchange.name} → {opportunity.sellExchange.name}
                        </p>
                        <p className="text-xs text-text-muted" data-testid={`opportunity-pair-${opportunity.id}`}>
                          {opportunity.tradingPair.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-profit-green font-bold" data-testid={`opportunity-profit-margin-${opportunity.id}`}>
                        +{parseFloat(opportunity.profitMargin).toFixed(2)}%
                      </p>
                      <p className="text-xs text-text-muted" data-testid={`opportunity-potential-${opportunity.id}`}>
                        ${parseFloat(opportunity.potentialProfit).toFixed(2)} profit
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <span className="text-text-muted">
                        Buy: <span className="font-mono text-white" data-testid={`opportunity-buy-price-${opportunity.id}`}>
                          ${parseFloat(opportunity.buyPrice).toFixed(2)}
                        </span>
                      </span>
                      <span className="text-text-muted">
                        Sell: <span className="font-mono text-white" data-testid={`opportunity-sell-price-${opportunity.id}`}>
                          ${parseFloat(opportunity.sellPrice).toFixed(2)}
                        </span>
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="px-3 py-1 bg-profit-green hover:bg-green-600 text-white text-xs font-medium transition-colors"
                      onClick={() => executeOpportunityMutation.mutate(opportunity.id)}
                      disabled={executeOpportunityMutation.isPending}
                      data-testid={`execute-opportunity-${opportunity.id}`}
                    >
                      {executeOpportunityMutation.isPending ? 'Executing...' : 'Execute'}
                    </Button>
                  </div>
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-text-muted" data-testid="no-opportunities">
              <p>No arbitrage opportunities detected</p>
              <p className="text-sm mt-2">The bot is scanning for profitable opportunities...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
