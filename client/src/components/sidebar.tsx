import { Gauge, TrendingUp, Bot, BarChart3, History, Settings } from "lucide-react";

interface SidebarProps {
  botStatus: any;
}

export function Sidebar({ botStatus }: SidebarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-profit-green bg-profit-green';
      case 'paused':
        return 'text-warning-orange bg-warning-orange';
      default:
        return 'text-text-muted bg-text-muted';
    }
  };

  return (
    <div className="w-64 bg-trading-slate border-r border-gray-700 flex flex-col" data-testid="sidebar">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-info-blue to-profit-green rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold">ArbitrageBot</h1>
            <p className="text-text-muted text-sm">Professional Trading</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4" data-testid="navigation">
        <ul className="space-y-2">
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-3 rounded-lg bg-info-blue text-white"
              data-testid="nav-dashboard"
            >
              <Gauge className="w-5 h-5" />
              <span>Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-3 rounded-lg text-text-secondary hover:bg-trading-panel hover:text-white transition-colors"
              data-testid="nav-arbitrage"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Arbitrage Scanner</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-3 rounded-lg text-text-secondary hover:bg-trading-panel hover:text-white transition-colors"
              data-testid="nav-bot"
            >
              <Bot className="w-5 h-5" />
              <span>Bot Control</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-3 rounded-lg text-text-secondary hover:bg-trading-panel hover:text-white transition-colors"
              data-testid="nav-analytics"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-3 rounded-lg text-text-secondary hover:bg-trading-panel hover:text-white transition-colors"
              data-testid="nav-history"
            >
              <History className="w-5 h-5" />
              <span>Trading History</span>
            </a>
          </li>
          <li>
            <a 
              href="#" 
              className="flex items-center space-x-3 p-3 rounded-lg text-text-secondary hover:bg-trading-panel hover:text-white transition-colors"
              data-testid="nav-settings"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-gray-700" data-testid="quick-stats">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Bot Status</span>
            <div className="flex items-center space-x-2">
              <div 
                className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor(botStatus?.status || 'stopped').split(' ')[1]}`}
                data-testid="bot-status-indicator"
              />
              <span 
                className={`text-sm font-medium ${getStatusColor(botStatus?.status || 'stopped').split(' ')[0]}`}
                data-testid="bot-status-text"
              >
                {botStatus?.status === 'running' ? 'Running' : 
                 botStatus?.status === 'paused' ? 'Paused' : 'Stopped'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">24h Profit</span>
            <span 
              className="text-sm font-mono text-profit-green"
              data-testid="daily-profit"
            >
              ${botStatus?.dailyProfit ? botStatus.dailyProfit.toFixed(2) : '0.00'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Active Pairs</span>
            <span 
              className="text-sm font-mono text-info-blue"
              data-testid="active-pairs"
            >
              {botStatus?.activePairs || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
