import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import AdminOverview from './pages/dashboard/AdminOverview';
import AdminPricing from './pages/dashboard/AdminPricing';
import AllOrders from './pages/dashboard/AllOrders';
import Users from './pages/dashboard/Users';
import History from './pages/dashboard/History';
import OrderTracking from './pages/dashboard/OrderTracking';
import Settings from './pages/dashboard/Settings';
import CourierManagement from './pages/dashboard/CourierManagement';
import Analytics from './pages/dashboard/Analytics';
import NotificationCenter from './pages/dashboard/NotificationCenter';
import AuditLog from './pages/dashboard/AuditLog';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Index: Admin Overview */}
            <Route index element={<AdminOverview />} />

            {/* ADMIN routes */}
            <Route path="all-orders" element={<AllOrders />} />
            <Route path="couriers" element={<CourierManagement />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="users" element={<Users />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="history" element={<History />} />
            <Route path="audit-log" element={<AuditLog />} />

            {/* Shared routes */}
            <Route path="track/:id" element={<OrderTracking />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
