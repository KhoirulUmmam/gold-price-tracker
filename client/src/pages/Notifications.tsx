import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

const Notifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("increase");
  const [whatsAppEnabled, setWhatsAppEnabled] = useState(true);
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [dailyTime, setDailyTime] = useState("20:00");
  
  // Fetch alerts
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/alerts'],
  });
  
  // Fetch notification logs
  const { data: notificationLogs } = useQuery({
    queryKey: ['/api/notification-logs'],
  });
  
  // Create alert mutation
  const createAlert = useMutation({
    mutationFn: async (newAlert) => {
      const response = await apiRequest('POST', '/api/alerts', newAlert);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert created",
        description: "Your price alert has been set successfully",
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create alert: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Delete alert mutation
  const deleteAlert = useMutation({
    mutationFn: async (alertId) => {
      await apiRequest('DELETE', `/api/alerts/${alertId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alert deleted",
        description: "Your price alert has been removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete alert: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  const resetForm = () => {
    setNotificationType("increase");
    setWhatsAppEnabled(true);
    setTelegramEnabled(false);
    setTargetPrice("");
    setPhoneNumber("");
    setTelegramChatId("");
    setDailyTime("20:00");
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!whatsAppEnabled && !telegramEnabled) {
      toast({
        title: "Warning",
        description: "Please enable at least one notification channel",
        variant: "destructive",
      });
      return;
    }
    
    if ((whatsAppEnabled && !phoneNumber) || (telegramEnabled && !telegramChatId)) {
      toast({
        title: "Warning",
        description: "Please fill in all required fields for enabled channels",
        variant: "destructive",
      });
      return;
    }
    
    if (notificationType !== "daily" && !targetPrice) {
      toast({
        title: "Warning",
        description: "Please enter a target price",
        variant: "destructive",
      });
      return;
    }
    
    const newAlert = {
      alertType: notificationType,
      targetPrice: notificationType !== "daily" ? parseFloat(targetPrice) : null,
      whatsappEnabled: whatsAppEnabled,
      telegramEnabled: telegramEnabled,
      phoneNumber: whatsAppEnabled ? phoneNumber : null,
      telegramChatId: telegramEnabled ? telegramChatId : null,
      dailyTime: notificationType === "daily" ? dailyTime : null,
      active: true
    };
    
    createAlert.mutate(newAlert);
  };
  
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-800">Price Alerts</h1>
          <p className="text-gray-500">Set up and manage price change notifications</p>
        </div>
        
        <div className="flex gap-3 mt-4 md:mt-0">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Price Alert</DialogTitle>
                <DialogDescription>
                  Get notified when gold prices change according to your criteria
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="notificationType">Alert Type</Label>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="increase"
                          name="notificationType"
                          value="increase"
                          checked={notificationType === "increase"}
                          onChange={() => setNotificationType("increase")}
                        />
                        <label htmlFor="increase">Price Increase Alert</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="decrease"
                          name="notificationType"
                          value="decrease"
                          checked={notificationType === "decrease"}
                          onChange={() => setNotificationType("decrease")}
                        />
                        <label htmlFor="decrease">Price Decrease Alert</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="daily"
                          name="notificationType"
                          value="daily"
                          checked={notificationType === "daily"}
                          onChange={() => setNotificationType("daily")}
                        />
                        <label htmlFor="daily">Daily Summary</label>
                      </div>
                    </div>
                  </div>
                  
                  {notificationType !== "daily" && (
                    <div className="grid gap-2">
                      <Label htmlFor="targetPrice">
                        Target Price (when price {notificationType === "increase" ? "exceeds" : "falls below"} this value)
                      </Label>
                      <Input
                        id="targetPrice"
                        placeholder="e.g., 1060000"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                      />
                    </div>
                  )}
                  
                  {notificationType === "daily" && (
                    <div className="grid gap-2">
                      <Label htmlFor="dailyTime">Time to Send Daily Summary</Label>
                      <Input
                        id="dailyTime"
                        type="time"
                        value={dailyTime}
                        onChange={(e) => setDailyTime(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <Label>Notification Channels</Label>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="whatsapp"
                          checked={whatsAppEnabled}
                          onCheckedChange={setWhatsAppEnabled}
                        />
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                      </div>
                      
                      {whatsAppEnabled && (
                        <Input
                          id="phoneNumber"
                          placeholder="Phone number with country code"
                          className="w-64"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="telegram"
                          checked={telegramEnabled}
                          onCheckedChange={setTelegramEnabled}
                        />
                        <Label htmlFor="telegram">Telegram</Label>
                      </div>
                      
                      {telegramEnabled && (
                        <Input
                          id="telegramChatId"
                          placeholder="Telegram Chat ID"
                          className="w-64"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={createAlert.isPending}>
                    {createAlert.isPending ? "Creating..." : "Create Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <div className="grid gap-4">
            {isLoading ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Loading alerts...</div>
                </CardContent>
              </Card>
            ) : alerts && alerts.length > 0 ? (
              alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          alert.alertType === "increase" 
                            ? "bg-[hsl(var(--increase))]" 
                            : alert.alertType === "decrease" 
                              ? "bg-[hsl(var(--decrease))]" 
                              : "bg-gray-400"
                        }`}>
                          {alert.alertType === "increase" && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          )}
                          {alert.alertType === "decrease" && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                          {alert.alertType === "daily" && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-700">
                            {alert.alertType === "increase" 
                              ? "Price increase alert" 
                              : alert.alertType === "decrease" 
                                ? "Price decrease alert" 
                                : "Daily summary"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {alert.alertType === "daily" 
                              ? `Send at ${alert.dailyTime} daily` 
                              : `Alert when ${alert.alertType === "increase" ? ">" : "<"} ${formatCurrency(alert.targetPrice)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {alert.whatsappEnabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-1">
                            WhatsApp
                          </span>
                        )}
                        {alert.telegramEnabled && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                            Telegram
                          </span>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => deleteAlert.mutate(alert.id)}
                          disabled={deleteAlert.isPending}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p>No active alerts found</p>
                    <Button className="mt-4" onClick={() => setOpen(true)}>Create Your First Alert</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>History of all sent notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Date & Time</th>
                      <th className="text-left p-2">Channel</th>
                      <th className="text-left p-2">Message</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notificationLogs && notificationLogs.length > 0 ? (
                      notificationLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="p-2 border-t">{formatDateTime(log.sentAt)}</td>
                          <td className="p-2 border-t">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              log.channel === "whatsapp" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {log.channel === "whatsapp" ? "WhatsApp" : "Telegram"}
                            </span>
                          </td>
                          <td className="p-2 border-t">{log.message}</td>
                          <td className="p-2 border-t">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              log.status === "sent" 
                                ? "bg-green-100 text-green-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {log.status === "sent" ? "Sent" : "Failed"}
                            </span>
                            {log.status === "failed" && log.errorMessage && (
                              <div className="text-xs text-red-500 mt-1">{log.errorMessage}</div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-4 text-center">No notification history found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Notifications;
