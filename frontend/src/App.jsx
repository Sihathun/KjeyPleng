import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import SearchPage from "./pages/SearchPage";
import ProductPage from "./pages/ProductPage";
import VendorDashboard from "./pages/Dashboard/VendorDashboard";


import { Routes, Route } from "react-router-dom";








function App() {

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<  HomePage />}/>
        <Route path="/subscribe" element={<  SubscriptionPage />}/>
        <Route path="/login" element={<  SignInPage />}/>
        <Route path="/signup" element={<  SignUpPage />}/>
        <Route path="/search" element={<  SearchPage />}/>
        <Route path="/product/test" element={<  ProductPage />}/>
        <Route path="/dashboard/*" element={<  VendorDashboard />}/>

      </Routes>

      <Footer />
    </div>
  )
}
export default App