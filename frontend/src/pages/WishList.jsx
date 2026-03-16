import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("activeTab", "wishlist");
    navigate("/profile");
  }, [navigate]);

  return null;
}
