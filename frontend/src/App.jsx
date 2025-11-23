import { BrowserRouter, Routes, Route } from "react-router-dom";
// FIX: Added .jsx extension to resolve import errors
import MainPage from "./pages/MainPage.jsx"; 
import Login from "./pages/Login.jsx";
import Navbar from "./pages/Navbar.jsx"; 
import Register from "./pages/Register.jsx";

export default function App() {
  return (
    // BrowserRouter enables client-side routing
    <BrowserRouter>
      {/* The Navbar is global, so we render it outside of the <Routes> 
        so it appears on every page. 
      */}
      <Navbar /> 
      
      {/* Routes define the different paths in your application */}
      <Routes>
        
        {/* Route for the Home Page (URL: /) */}
        <Route path="/" element={<MainPage />} />
        
        {/* Route for the Login Page (URL: /login) */}
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register/>} />
        
        {/* You can add more routes here, like for Register or Cart */}
        {/* <Route path="/register" element={<Register />} /> */}
        {/* <Route path="/cart" element={<Cart />} /> */}

        {/* Optional: Add a 404 Not Found Page */}
        <Route path="*" element={<div className="p-10 text-center text-3xl font-bold">404 - Page Not Found</div>} />
        
      </Routes>
    </BrowserRouter>
  );
}