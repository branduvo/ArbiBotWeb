import { useState } from "react";
import { Play, Pause, Square, Settings, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BotSettings {
  minProfitMargin: string;
  maxPositionSize: string;
  slippageTolerance: string;
  gasLimit: number;
}

interface BotControlProps {
  botStatus: any;
  onSettingsClick: () => void;
}

export function BotControl({ botStatus, onSettingsClick }: BotControlProps) {
  const { toast } = useToast();

  // Bot control mutations
  const startBotMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/start'),
    onSuccess: () => {
      toast({
        title: "Bot Started",
        description: "Trading bot is now active and scanning for opportunities.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Start Bot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pauseBotMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/pause'),
    onSuccess: () => {
      toast({
        title: "Bot Paused",
        description: "Trading bot has been paused.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Pause Bot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const stopBotMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/bot/stop'),
    onSuccess: () => {
      toast({
        title: "Bot Stopped",
        description: "Trading bot has been stopped.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/status'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Stop Bot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch bot settings
  const { data: settings } = useQuery<BotSettings>({
    queryKey: ['/api/bot/settings'],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-profit-green';
      case 'paused':
        return 'text-warning-orange';
      default:
        return 'text-text-muted';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Bot Active';
      case 'paused':
        return 'Bot Paused';
      default:
        return 'Bot Stopped';
    }
  };

  const formatRuntime = (startTime: string | null) => {
    if (!startTime) return 'Not running';
    
    const start = new Date(startTime);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-trading-panel rounded-xl border border-gray-700" data-testid="bot-control">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-bold">Bot Control Center</h3>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Bot Status */}
        <div className="text-center p-4 bg-trading-dark rounded-lg" data-testid="bot-status">
          <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
            botStatus?.status === 'running' ? 'bg-profit-green/20' : 
            botStatus?.status === 'paused' ? 'bg-warning-orange/20' : 
            'bg-text-muted/20'
          }`}>
            <Bot className={`text-2xl ${getStatusColor(botStatus?.status || 'stopped')}`} />
          </div>
          <h4 className={`font-bold mb-2 ${getStatusColor(botStatus?.status || 'stopped')}`} data-testid="bot-status-text">
            {getStatusText(botStatus?.status || 'stopped')}
          </h4>
          <p className="text-sm text-text-muted" data-testid="bot-runtime">
            {botStatus?.status === 'running' ? `Running for ${formatRuntime(botStatus.startTime)}` : 'Not active'}
          </p>
        </div>

        {/* Trading Controls */}
        <div className="space-y-3" data-testid="trading-controls">
          <Button
            className="w-full py-3 bg-profit-green hover:bg-green-600 text-white font-medium transition-colors"
            onClick={() => startBotMutation.mutate()}
            disabled={startBotMutation.isPending || botStatus?.status === 'running'}
            data-testid="start-bot-btn"
          >
            <Play className="w-4 h-4 mr-2" />
            {startBotMutation.isPending ? 'Starting...' : 'Start Trading'}
          </Button>
          
          <Button
            className="w-full py-3 bg-warning-orange hover:bg-orange-600 text-white font-medium transition-colors"
            onClick={() => pauseBotMutation.mutate()}
            disabled={pauseBotMutation.isPending || botStatus?.status !== 'running'}
            data-testid="pause-bot-btn"
          >
            <Pause className="w-4 h-4 mr-2" />
            {pauseBotMutation.isPending ? 'Pausing...' : 'Pause Bot'}
          </Button>
          
          <Button
            className="w-full py-3 bg-loss-red hover:bg-red-600 text-white font-medium transition-colors"
            onClick={() => stopBotMutation.mutate()}
            disabled={stopBotMutation.isPending || botStatus?.status === 'stopped'}
            data-testid="stop-bot-btn"
          >
            <Square className="w-4 h-4 mr-2" />
            {stopBotMutation.isPending ? 'Stopping...' : 'Stop Bot'}
          </Button>
        </div>

        {/* Current Settings */}
        <div className="bg-trading-dark rounded-lg p-4" data-testid="current-settings">
          <h5 className="font-medium mb-3">Current Settings</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Min Profit %</span>
              <span className="font-mono" data-testid="setting-min-profit">
                {settings?.minProfitMargin || '0.25'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Max Position</span>
              <span className="font-mono" data-testid="setting-max-position">
                ${settings?.maxPositionSize || '5,000'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Slippage</span>
              <span className="font-mono" data-testid="setting-slippage">
                {settings?.slippageTolerance || '0.5'}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Gas Limit</span>
              <span className="font-mono" data-testid="setting-gas-limit">
                {settings?.gasLimit ? `${settings.gasLimit / 1000}K` : '500K'}
              </span>
            </div>
          </div>
          
          <Button
            className="w-full mt-3 py-2 bg-info-blue hover:bg-blue-600 text-white text-sm font-medium transition-colors"
            onClick={onSettingsClick}
            data-testid="adjust-settings-btn"
          >
            <Settings className="w-4 h-4 mr-2" />
            Adjust Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
