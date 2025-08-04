import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ChatAssistant from "./pages/chatpage/ChatAssistant";
import DosageCalculator from "./pages/DosageCalculator";
import Drugs from "./pages/Drugs";
import PersonalCare from "./pages/PersonalCare";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/voice-assistant" element={<ChatAssistant />} />
          <Route path="/dosage-calculator" element={<DosageCalculator />} />
          <Route path="/drugs" element={<Drugs />} />
          <Route path="/personal-care" element={<PersonalCare />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
