import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PriceHistory from "@/pages/PriceHistory";
import Calculator from "@/pages/Calculator";
import Notifications from "@/pages/Notifications";
import MyInvestments from "@/pages/MyInvestments";
import ProfitAnalytics from "@/pages/ProfitAnalytics";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/price-history" component={PriceHistory} />
        <Route path="/calculator" component={Calculator} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/my-investments" component={MyInvestments} />
        <Route path="/profit-analytics" component={ProfitAnalytics} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
