import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";

function App() {

  return (
    <div>
      <Navbar />

      <Routes>
        <Route path="/" element={<  HomePage />}/>
      </Routes>

      <Footer />
    </div>
  )
}
export default App
