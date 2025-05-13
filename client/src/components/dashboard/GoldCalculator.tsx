import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";

const GoldCalculator = ({ currentPrice }) => {
  const [weight, setWeight] = useState("1");
  const [purity, setPurity] = useState("0.999");
  const [calculationType, setCalculationType] = useState("buy");
  const [calculatedValue, setCalculatedValue] = useState(0);
  
  // Calculate value when inputs change or props update
  useEffect(() => {
    if (currentPrice) {
      handleCalculate();
    }
  }, [weight, purity, calculationType, currentPrice]);
  
  const handleCalculate = () => {
    if (!currentPrice) return;
    
    const weightValue = parseFloat(weight) || 0;
    const purityValue = parseFloat(purity) || 0.999;
    
    // Use appropriate price based on calculation type
    let price = currentPrice;
    
    setCalculatedValue(weightValue * purityValue * price);
  };
  
  return (
    <Card className="bg-white rounded-xl shadow-sm">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Gold Calculator</h2>
      </div>
      <CardContent className="p-5">
        <div className="mb-4">
          <Label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Gold Weight (gram)</Label>
          <Input 
            type="number" 
            id="weight" 
            name="weight" 
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[hsl(var(--primary-light))] focus:ring-[hsl(var(--primary-light))] sm:text-sm" 
            placeholder="Enter weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        
        <div className="mb-4">
          <Label htmlFor="purity" className="block text-sm font-medium text-gray-700 mb-1">Purity</Label>
          <Select value={purity} onValueChange={setPurity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select purity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.999">99.9% (24K)</SelectItem>
              <SelectItem value="0.916">91.6% (22K)</SelectItem>
              <SelectItem value="0.75">75% (18K)</SelectItem>
              <SelectItem value="0.585">58.5% (14K)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Calculation Type</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input 
                type="radio" 
                id="buy" 
                name="calculationType" 
                value="buy" 
                className="hidden peer" 
                checked={calculationType === "buy"}
                onChange={() => setCalculationType("buy")}
              />
              <label 
                htmlFor="buy" 
                className="flex items-center justify-center p-2 text-gray-500 bg-[hsl(var(--muted))] rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[hsl(var(--primary))] peer-checked:text-white hover:text-gray-600 hover:bg-gray-100"
              >
                Buy Value
              </label>
            </div>
            <div>
              <input 
                type="radio" 
                id="sell" 
                name="calculationType" 
                value="sell" 
                className="hidden peer"
                checked={calculationType === "sell"}
                onChange={() => setCalculationType("sell")}
              />
              <label 
                htmlFor="sell" 
                className="flex items-center justify-center p-2 text-gray-500 bg-[hsl(var(--muted))] rounded-lg border border-gray-200 cursor-pointer peer-checked:bg-[hsl(var(--primary))] peer-checked:text-white hover:text-gray-600 hover:bg-gray-100"
              >
                Sell Value
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-5">
          <Button 
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-[hsl(var(--primary-dark))] bg-[hsl(var(--gold))] hover:bg-[hsl(var(--gold-dark))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--gold-dark))] transition"
            onClick={handleCalculate}
          >
            Calculate
          </Button>
        </div>
        
        <div className="mt-5 p-4 bg-[hsl(var(--muted))] rounded-lg">
          <div className="text-center">
            <span className="text-sm text-gray-500">Estimated Value</span>
            <div className="text-2xl font-bold text-[hsl(var(--primary-dark))]">
              {formatCurrency(calculatedValue)}
            </div>
            <span className="text-xs text-gray-500">Based on current {calculationType} price</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoldCalculator;
