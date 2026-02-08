import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import AllJobs from './pages/AllJobs';
import JobDetails from "./pages/JobDetails";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Auth from "./pages/Auth";
import StaticPages from "./pages/StaticPages";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import AdSenseLoader from "./components/common/AdSenseLoader";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <TooltipProvider>
          <AdSenseLoader />
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/all-jobs" element={<AllJobs />} />
            <Route path="/jobs/:countrySlug" element={<AllJobs />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:postId" element={<BlogPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedRoute requireEmployee>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<StaticPages />} />
            <Route path="/privacy" element={<StaticPages />} />
            <Route path="/terms" element={<StaticPages />} />
            <Route path="*" element={<NotFound />} />

          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
