import VendorSidebar from "../../components/VendorSidebar";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import SalesDashboardPage from "./pages/SalesDashboardPage";
import ListDashboardPage from "./pages/ListDashboardPage";

function VendorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname.includes('/sales')) return 'dashboard';
    if (location.pathname.includes('/list-product')) return 'list-product';
    if (location.pathname.includes('/manage-product')) return 'manage-product';
    if (location.pathname.includes('/orders')) return 'orders';
    return 'dashboard';
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="flex">
      <VendorSidebar 
        activeTab={getActiveTab()} 
        onNavigate={handleNavigate}
      />
      <div className="flex-1">
        <Routes>
          <Route index element={<Navigate to="sales" replace />} />
          <Route path="sales" element={<SalesDashboardPage />}/>
          <Route path="list-product" element={<ListDashboardPage/>}/>
          {/* Add more routes here as needed */}
        </Routes>
      </div>
    </div>
  )
}
export default VendorDashboard;