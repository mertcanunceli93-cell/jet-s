import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layouts/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import CreateOrder from './pages/dashboard/CreateOrder';
import CourierOverview from './pages/dashboard/CourierOverview';
import CorporateDashboard from './pages/dashboard/CorporateDashboard';
import History from './pages/dashboard/History';
import OrderTracking from './pages/dashboard/OrderTracking';
import Settings from './pages/dashboard/Settings';
import Addresses from './pages/dashboard/Addresses';
import AdminOverview from './pages/dashboard/AdminOverview';
import AdminPricing from './pages/dashboard/AdminPricing';
import AllOrders from './pages/dashboard/AllOrders';
import Users from './pages/dashboard/Users';
import { useAuth } from './store/useAuth';

function App() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            {/* Index: role-based redirect */}
            <Route index element={
              user?.role === 'COURIER' ? <CourierOverview /> :
              user?.role === 'CORPORATE' ? <CorporateDashboard /> :
              <Overview />
            } />

            {/* USER routes */}
            <Route path="create-order" element={<CreateOrder />} />
            <Route path="history" element={<History />} />
            <Route path="addresses" element={<Addresses />} />

            {/* COURIER routes */}
            <Route path="available" element={<CourierOverview />} />
            <Route path="earnings" element={<CourierOverview />} />

            {/* ADMIN routes */}
            <Route path="admin" element={<AdminOverview />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="all-orders" element={<AllOrders />} />
            <Route path="users" element={<Users />} />

            {/* Shared routes */}
            <Route path="track/:id" element={<OrderTracking />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
