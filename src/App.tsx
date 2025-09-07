import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
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

// Este componente é o 'core' do seu aplicativo
function AppRoutes() {
  const { loading } = useBases();
  const navigate = useNavigate();

  useEffect(() => {
    // Adiciona o listener para o botão "Voltar" do Android
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        // Se houver histórico de navegação no aplicativo, volte
        navigate(-1);
      } else {
        // Se estiver na tela inicial, saia do aplicativo
        CapacitorApp.exitApp();
      }
    });

    // Função de limpeza para remover o listener quando o componente for desmontado
    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [navigate]); // O array de dependências garante que o efeito seja re-executado se a função 'navigate' mudar

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/bases" element={<Bases />} />
      <Route path="/bases/add" element={<AddEditBase />} />
      <Route path="/bases/edit/:id" element={<AddEditBase />} />
      <Route path="/calcular" element={<Calculator />} />
      <Route path="/relatorio" element={<Report />} />
      <Route path="/configuracoes" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BasesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </BasesProvider>
  </QueryClientProvider>
);

export default App;