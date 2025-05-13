import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";

const Calculator = () => {
  // Fetch current gold prices
  const { data: goldData, isLoading } = useQuery({
    queryKey: ['/api/gold-prices/current'],
  });
  
  // States for basic calculator
  const [weight, setWeight] = useState("1");
  const [purity, setPurity] = useState("0.999");
  const [calculationType, setCalculationType] = useState("buy");
  const [calculatedValue, setCalculatedValue] = useState(0);
  
  // States for investment calculator
  const [investmentAmount, setInvestmentAmount] = useState("1000000");
  const [duration, setDuration] = useState("1");
  const [expectedGrowthRate, setExpectedGrowthRate] = useState("5");
  const [projectedValue, setProjectedValue] = useState(0);
  const [projectedWeight, setProjectedWeight] = useState(0);
  
  // Calculate gold value
  const calculateGoldValue = () => {
    if (!goldData) return;
    
    const weightValue = parseFloat(weight);
    const purityValue = parseFloat(purity);
    
    if (isNaN(weightValue) || isNaN(purityValue)) return;
    
    if (calculationType === "buy") {
      setCalculatedValue(weightValue * purityValue * parseFloat(goldData.buyPrice));
    } else {
      setCalculatedValue(weightValue * purityValue * parseFloat(goldData.sellPrice));
    }
  };
  
  // Calculate investment projection
  const calculateInvestmentProjection = () => {
    if (!goldData) return;
    
    const amount = parseFloat(investmentAmount);
    const years = parseFloat(duration);
    const growthRate = parseFloat(expectedGrowthRate) / 100;
    
    if (isNaN(amount) || isNaN(years) || isNaN(growthRate)) return;
    
    // Calculate projected value
    const projValue = amount * Math.pow((1 + growthRate), years);
    setProjectedValue(projValue);
    
    // Calculate projected weight in grams
    const currentGoldPrice = parseFloat(goldData.buyPrice);
    setProjectedWeight(amount / currentGoldPrice);
  };
  
  // Calculate when any input changes
  useEffect(() => {
    if (goldData) {
      calculateGoldValue();
    }
  }, [weight, purity, calculationType, goldData]);
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">Gold Calculator</h1>
        <p className="text-gray-500">Calculate gold value and investment projections</p>
      </div>
      
      <Tabs defaultValue="basic" className="mb-6">
        <TabsList>
          <TabsTrigger value="basic">Basic Calculator</TabsTrigger>
          <TabsTrigger value="investment">Investment Projection</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Gold Value Calculator</CardTitle>
              <CardDescription>Calculate the value of gold based on weight and purity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="weight">Gold Weight (gram)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    placeholder="Enter weight" 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="purity">Purity</Label>
                  <Select value={purity} onValueChange={setPurity}>
                    <SelectTrigger>
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
                
                <div className="grid gap-3">
                  <Label>Calculation Type</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="buy" 
                        name="calculationType" 
                        value="buy" 
                        checked={calculationType === "buy"}
                        onChange={() => setCalculationType("buy")} 
                        className="mr-2"
                      />
                      <label htmlFor="buy">Buy Value</label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        id="sell" 
                        name="calculationType" 
                        value="sell" 
                        checked={calculationType === "sell"}
                        onChange={() => setCalculationType("sell")} 
                        className="mr-2"
                      />
                      <label htmlFor="sell">Sell Value</label>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-[hsl(var(--gold))] text-[hsl(var(--primary))] hover:bg-[hsl(var(--gold-dark))]"
                  onClick={calculateGoldValue}
                >
                  Calculate
                </Button>
                
                <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                  <div className="text-center">
                    <span className="text-sm text-gray-500">Estimated Value</span>
                    <div className="text-2xl font-bold text-[hsl(var(--primary))]">
                      {isLoading ? 'Loading...' : formatCurrency(calculatedValue)}
                    </div>
                    <span className="text-xs text-gray-500">
                      Based on current {calculationType === "buy" ? "buy" : "sell"} price
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investment">
          <Card>
            <CardHeader>
              <CardTitle>Investment Projection</CardTitle>
              <CardDescription>Project the future value of your gold investment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="investmentAmount">Investment Amount (IDR)</Label>
                  <Input 
                    id="investmentAmount" 
                    type="number" 
                    placeholder="Enter amount in IDR" 
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="duration">Investment Duration (years)</Label>
                  <Input 
                    id="duration" 
                    type="number" 
                    placeholder="Enter duration in years" 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="expectedGrowthRate">Expected Annual Growth Rate (%)</Label>
                  <Input 
                    id="expectedGrowthRate" 
                    type="number" 
                    placeholder="Enter expected growth rate" 
                    value={expectedGrowthRate}
                    onChange={(e) => setExpectedGrowthRate(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-light))]"
                  onClick={calculateInvestmentProjection}
                >
                  Calculate Projection
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">Current Gold Amount</span>
                      <div className="text-xl font-bold text-[hsl(var(--primary))]">
                        {isLoading ? 'Loading...' : `${projectedWeight.toFixed(2)} grams`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
                    <div className="text-center">
                      <span className="text-sm text-gray-500">Projected Value</span>
                      <div className="text-xl font-bold text-[hsl(var(--primary))]">
                        {formatCurrency(projectedValue)}
                      </div>
                      <span className="text-xs text-gray-500">
                        After {duration} {parseInt(duration) === 1 ? 'year' : 'years'} at {expectedGrowthRate}% growth
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Current Pegadaian Gold Prices</CardTitle>
          <CardDescription>Latest prices used for calculations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500">Buy Price</span>
                <div className="text-xl font-bold">
                  {isLoading ? 'Loading...' : formatCurrency(goldData?.buyPrice)}
                </div>
                <span className="text-xs text-gray-500">Per gram</span>
              </div>
            </div>
            
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500">Sell Price</span>
                <div className="text-xl font-bold">
                  {isLoading ? 'Loading...' : formatCurrency(goldData?.sellPrice)}
                </div>
                <span className="text-xs text-gray-500">Per gram</span>
              </div>
            </div>
            
            <div className="p-4 bg-[hsl(var(--muted))] rounded-lg">
              <div className="text-center">
                <span className="text-sm text-gray-500">Spread</span>
                <div className="text-xl font-bold">
                  {isLoading ? 'Loading...' : formatCurrency(goldData?.buyPrice - goldData?.sellPrice)}
                </div>
                <span className="text-xs text-gray-500">Buy-sell difference</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Calculator;
