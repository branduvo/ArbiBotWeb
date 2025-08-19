import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BotSettings {
  id?: string;
  minProfitMargin: string;
  maxPositionSize: string;
  slippageTolerance: string;
  gasLimit: number;
  stopLoss: string;
  dailyLossLimit: string;
  autoPauseOnLoss: boolean;
  isActive: boolean;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<BotSettings>>({
    minProfitMargin: "0.25",
    maxPositionSize: "5000",
    slippageTolerance: "0.5",
    gasLimit: 500000,
    stopLoss: "2.0",
    dailyLossLimit: "1000",
    autoPauseOnLoss: true,
  });

  // Fetch current settings
  const { data: currentSettings } = useQuery<BotSettings>({
    queryKey: ['/api/bot/settings'],
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: Partial<BotSettings>) => 
      apiRequest('POST', '/api/bot/settings', settings),
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Bot configuration has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bot/settings'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof BotSettings, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      data-testid="settings-modal"
    >
      <div className="bg-trading-panel rounded-xl border border-gray-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Bot Configuration</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="close-settings"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Trading Parameters */}
          <div data-testid="trading-parameters">
            <h4 className="text-lg font-medium mb-4">Trading Parameters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minProfitMargin">Minimum Profit Margin (%)</Label>
                <Input
                  id="minProfitMargin"
                  type="number"
                  step="0.01"
                  value={formData.minProfitMargin}
                  onChange={(e) => handleInputChange('minProfitMargin', e.target.value)}
                  className="bg-trading-dark border-gray-600 focus:border-info-blue"
                  data-testid="input-min-profit"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxPositionSize">Maximum Position Size ($)</Label>
                <Input
                  id="maxPositionSize"
                  type="number"
                  value={formData.maxPositionSize}
                  onChange={(e) => handleInputChange('maxPositionSize', e.target.value)}
                  className="bg-trading-dark border-gray-600 focus:border-info-blue"
                  data-testid="input-max-position"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slippageTolerance">Slippage Tolerance (%)</Label>
                <Input
                  id="slippageTolerance"
                  type="number"
                  step="0.1"
                  value={formData.slippageTolerance}
                  onChange={(e) => handleInputChange('slippageTolerance', e.target.value)}
                  className="bg-trading-dark border-gray-600 focus:border-info-blue"
                  data-testid="input-slippage"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gasLimit">Gas Limit</Label>
                <Input
                  id="gasLimit"
                  type="number"
                  value={formData.gasLimit}
                  onChange={(e) => handleInputChange('gasLimit', parseInt(e.target.value))}
                  className="bg-trading-dark border-gray-600 focus:border-info-blue"
                  data-testid="input-gas-limit"
                />
              </div>
            </div>
          </div>

          {/* Exchange Selection */}
          <div data-testid="exchange-selection">
            <h4 className="text-lg font-medium mb-4">Active Exchanges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['Binance', 'Coinbase Pro', 'Kraken', 'Uniswap V3'].map((exchange) => (
                <Label 
                  key={exchange}
                  className="flex items-center space-x-3 p-3 bg-trading-dark rounded-lg cursor-pointer hover:bg-gray-700"
                  data-testid={`exchange-${exchange.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Checkbox defaultChecked />
                  <span>{exchange}</span>
                </Label>
              ))}
            </div>
          </div>

          {/* Risk Management */}
          <div data-testid="risk-management">
            <h4 className="text-lg font-medium mb-4">Risk Management</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.1"
                  value={formData.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  className="bg-trading-dark border-gray-600 focus:border-info-blue"
                  data-testid="input-stop-loss"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dailyLossLimit">Daily Loss Limit ($)</Label>
                <Input
                  id="dailyLossLimit"
                  type="number"
                  value={formData.dailyLossLimit}
                  onChange={(e) => handleInputChange('dailyLossLimit', e.target.value)}
                  className="bg-trading-dark border-gray-600 focus:border-info-blue"
                  data-testid="input-daily-loss-limit"
                />
              </div>
              
              <Label className="flex items-center space-x-3">
                <Checkbox
                  checked={formData.autoPauseOnLoss}
                  onCheckedChange={(checked) => handleInputChange('autoPauseOnLoss', checked as boolean)}
                  data-testid="checkbox-auto-pause"
                />
                <span className="text-sm">Auto-pause on consecutive losses</span>
              </Label>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-600 hover:border-gray-500"
              data-testid="cancel-settings"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-info-blue hover:bg-blue-600"
              disabled={updateSettingsMutation.isPending}
              data-testid="save-settings"
            >
              {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
