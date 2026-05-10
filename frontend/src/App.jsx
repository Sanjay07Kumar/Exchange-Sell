import { BrowserRouter, Routes, Route } from "react-router-dom";
// FIX: Added .jsx extension to resolve import errors
import MainPage from "./pages/MainPage.jsx"; 
import Login from "./pages/Login.jsx";
import Navbar from "./pages/Navbar.jsx"; 
import Register from "./pages/Register.jsx";
import CategoryPage from "./pages/CategoryPage.jsx";
import ItemDetails from "./pages/ItemDetails.jsx"; 
import AddItem from "./pages/addItem.jsx";
import Profile from "./pages/Profile.jsx";
import Cart from "./pages/Cart.jsx";
import Search from "./pages/Search.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Messages from "./pages/Messages.jsx";
// wishlist page removed; wishlist shown inside profile

export default function App() {
  return (

    <BrowserRouter>
      <Navbar /> 
      
      <Routes>
        
        <Route path="/" element={<MainPage />} />
        
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register/>} />
        <Route path="/items/category/:id" element={<CategoryPage />} />
        <Route path="/items/:id" element={<ItemDetails />} />
        <Route path="/addItem" element={<AddItem />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat" element={<Messages />} />
        <Route path="/chat/room/:roomId" element={<ChatPage />} />
        {/* wishlist route removed; profile handles wishlist */}
      </Routes>
    </BrowserRouter>
  );
}