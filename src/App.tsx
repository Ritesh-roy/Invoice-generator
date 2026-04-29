import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/Invoices";
import InvoiceEditor from "./pages/InvoiceEditor";
import InvoiceDetail from "./pages/InvoiceDetail";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound.tsx";
import { useStore } from "@/lib/store";

const queryClient = new QueryClient();

const App = () => {
  const currentUser = useStore((s) => s.auth.currentUser);
  const protect = (element: JSX.Element) => currentUser ? element : <Navigate to="/login" replace />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={protect(<Dashboard />)} />
              <Route path="/invoices" element={protect(<Invoices />)} />
              <Route path="/invoices/new" element={protect(<InvoiceEditor />)} />
              <Route path="/invoices/:id" element={protect(<InvoiceDetail />)} />
              <Route path="/invoices/:id/edit" element={protect(<InvoiceEditor />)} />
              <Route path="/clients" element={protect(<Clients />)} />
              <Route path="/settings" element={protect(<Settings />)} />
            </Route>
            <Route path="/login" element={currentUser ? <Navigate to="/" replace /> : <Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
