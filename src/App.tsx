import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BasesProvider, useBases } from "./contexts/BasesContext";
import { Spinner } from "./components/ui/spinner";
import Home from "./pages/Home";
import Bases from "./pages/Bases";
import AddEditBase from "./pages/AddEditBase";
import Calculator from "./pages/Calculator";
import Report from "./pages/Report";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { loading } = useBases();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">Carregando aplicativo...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bases" element={<Bases />} />
        <Route path="/bases/add" element={<AddEditBase />} />
        <Route path="/bases/edit/:id" element={<AddEditBase />} />
        <Route path="/calcular" element={<Calculator />} />
        <Route path="/relatorio" element={<Report />} />
        <Route path="/configuracoes" element={<Settings />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BasesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </BasesProvider>
  </QueryClientProvider>
);

export default App;
