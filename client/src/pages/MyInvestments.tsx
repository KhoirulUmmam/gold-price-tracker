import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const MyInvestments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Form state
  const [purchaseDate, setPurchaseDate] = useState("");
  const [weight, setWeight] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purity, setPurity] = useState("0.999");
  const [notes, setNotes] = useState("");
  
  // Current gold price for calculations
  const { data: currentGoldPrice } = useQuery({
    queryKey: ['/api/gold-prices/current'],
  });
  
  // Fetch investments
  const { data: investments, isLoading } = useQuery({
    queryKey: ['/api/investments'],
  });
  
  // Create investment mutation
  const createInvestment = useMutation({
    mutationFn: async (newInvestment) => {
      const response = await apiRequest('POST', '/api/investments', newInvestment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      toast({
        title: "Investment recorded",
        description: "Your gold investment has been added successfully",
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record investment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete investment mutation
  const deleteInvestment = useMutation({
    mutationFn: async (investmentId) => {
      await apiRequest('DELETE', `/api/investments/${investmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/investments'] });
      toast({
        title: "Investment deleted",
        description: "Your investment record has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete investment: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setPurchaseDate("");
    setWeight("");
    setPurchasePrice("");
    setPurity("0.999");
    setNotes("");
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!purchaseDate || !weight || !purchasePrice) {
      toast({
        title: "Warning",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newInvestment = {
      purchaseDate: new Date(purchaseDate).toISOString(),
      weight: parseFloat(weight),
      purchasePrice: parseFloat(purchasePrice),
      purity: parseFloat(purity),
      notes: notes.trim() || null
    };
    
    createInvestment.mutate(newInvestment);
  };
  
  // Calculate totals
  const calculateTotals = () => {
    if (!investments || investments.length === 0 || !currentGoldPrice) {
      return {
        totalInvestment: 0,
        totalWeight: 0,
        currentValue: 0,
        totalProfit: 0,
        profitPercentage: 0,
        profitIfSold: 0
      };
    }
    
    const totalInvestment = investments.reduce((sum, inv) => sum + parseFloat(inv.purchasePrice), 0);
    const totalWeight = investments.reduce((sum, inv) => sum + parseFloat(inv.weight), 0);
    const currentValue = totalWeight * parseFloat(currentGoldPrice.pricePerGram);
    const totalProfit = currentValue - totalInvestment;
    const profitPercentage = (totalProfit / totalInvestment) * 100;
    
    // Calculate profit if sold today (including fees, taxes, etc.)
    const sellValue = totalWeight * parseFloat(currentGoldPrice.sellPrice);
    const profitIfSold = sellValue - totalInvestment;
    
    return {
      totalInvestment,
      totalWeight,
      currentValue,
      totalProfit,
      profitPercentage,
      profitIfSold
    };
  };
  
  const totals = calculateTotals();
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">My Investments</h1>
          <p className="text-gray-500">Track your gold investments and their performance</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Investment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record New Investment</DialogTitle>
                <DialogDescription>
                  Record details about your gold purchase
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="weight">Weight (grams)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 10"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="purchasePrice">Purchase Price (IDR)</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      placeholder="e.g., 5000000"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid gap-2">
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional information about this purchase"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createInvestment.isPending}>
                    {createInvestment.isPending ? "Saving..." : "Save Investment"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Investment</div>
            <div className="text-xl font-bold mt-1">{formatCurrency(totals.totalInvestment)}</div>
            <div className="text-xs text-gray-500 mt-1">{totals.totalWeight.toFixed(1)} grams</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Current Value</div>
            <div className="text-xl font-bold mt-1">{formatCurrency(totals.currentValue)}</div>
            <div className="text-xs text-gray-500 mt-1">Based on current price</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Total Profit</div>
            <div className={`text-xl font-bold mt-1 ${totals.totalProfit >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
              {totals.totalProfit >= 0 ? '+' : ''}{formatCurrency(totals.totalProfit)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {totals.profitPercentage >= 0 ? '+' : ''}{totals.profitPercentage.toFixed(2)}% ROI
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-500">Profit if Sold Today</div>
            <div className={`text-xl font-bold mt-1 ${totals.profitIfSold >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
              {totals.profitIfSold >= 0 ? '+' : ''}{formatCurrency(totals.profitIfSold)}
            </div>
            <div className="text-xs text-gray-500 mt-1">After fees & taxes</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Investment Records</CardTitle>
          <CardDescription>Details of all your gold purchases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (g)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit %</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">Loading investments...</td>
                  </tr>
                ) : investments && investments.length > 0 ? (
                  investments.map((investment) => {
                    const currentValue = parseFloat(investment.weight) * (currentGoldPrice ? parseFloat(currentGoldPrice.pricePerGram) : 0);
                    const profit = currentValue - parseFloat(investment.purchasePrice);
                    const profitPercentage = (profit / parseFloat(investment.purchasePrice)) * 100;
                    
                    return (
                      <tr key={investment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(investment.purchaseDate, "date")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(investment.weight).toFixed(1)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(investment.purchasePrice)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(currentValue)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${profit >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
                          {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${profitPercentage >= 0 ? 'text-[hsl(var(--increase))]' : 'text-[hsl(var(--decrease))]'}`}>
                          {profitPercentage >= 0 ? '+' : ''}{profitPercentage.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteInvestment.mutate(investment.id)}
                            disabled={deleteInvestment.isPending}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center">
                      <p>No investment records found</p>
                      <Button className="mt-4" onClick={() => setOpen(true)}>Record Your First Investment</Button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MyInvestments;
