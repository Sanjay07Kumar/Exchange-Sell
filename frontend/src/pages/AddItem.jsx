import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, ImagePlus, Tag, AlignLeft, Clock, Sparkles, ArrowRight } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";

function AddItem() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(Array(6).fill(null));
  const navigate = useNavigate();

  const isLoggedIn = !!getAuthToken();

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    price: "",
    isNegotiable: false,
    description: "",
    isAvailable: true,
    forExchange: false,
    itemAge: "",
    condition: "",
  });

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    axios.get("http://localhost:8080/categories/all").then((res) => {
      setCategories(res.data);
    });
  }, [isLoggedIn, navigate]);

  const handleAddMoreBox = () => {
    setImages([...images, null]);
  };

  const handleImageChange = (file, index) => {
    const updated = [...images];
    updated[index] = {
      file,
      preview: URL.createObjectURL(file),
    };
    setImages(updated);
  };

  const openFilePicker = (index) => {
    document.getElementById(`imageInput-${index}`).click();
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Please login first!");
        navigate("/login");
        return;
      }
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      images.forEach((img) => {
        if (img?.file) formData.append("images", img.file);
      });
      await axios.post("http://localhost:8080/items/add-items", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Item Added Successfully!");
      setForm({
        name: "",
        categoryId: "",
        price: "",
        isNegotiable: false,
        description: "",
        isAvailable: true,
        forExchange: false,
        itemAge: "",
        condition: "",
      });
      setImages(Array(6).fill(null));
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  if (!isLoggedIn)
    return (
      <p className="text-center mt-20 text-xl font-semibold text-gray-700">
        Redirecting to login...
      </p>
    );

  return (
    <div className="w-full min-h-screen bg-gray-50 mt-[70px]">

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold tracking-[4px] uppercase text-orange-500 mb-1">
              Marketplace
            </p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Post an <span className="text-orange-500">Item</span>
            </h1>
          </div>
          <p className="text-sm text-gray-400 mb-1 hidden md:block">
            Fill in the details below to list your item
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8 items-start">

        <div className="w-full lg:w-[400px] bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-shrink-0">

          <div className="bg-gray-900 px-5 py-4 flex items-center gap-3">
            <ImagePlus size={16} className="text-orange-400" />
            <span className="text-xs font-bold tracking-[3px] uppercase text-white">
              Product Images
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 p-5">
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => openFilePicker(index)}
                className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 relative overflow-hidden group"
              >
                <input
                  id={`imageInput-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files[0], index)}
                />
                {img ? (
                  <img
                    src={img.preview}
                    className="w-full h-full object-cover rounded-xl"
                    alt="preview"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-300 group-hover:text-orange-500 transition-colors duration-200">
                    <Plus size={28} strokeWidth={1.5} />
                    <span className="text-[10px] font-semibold tracking-widest uppercase">
                      Upload
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={handleAddMoreBox}
              className="w-full py-3 border-2 border-gray-900 rounded-xl text-gray-900 text-sm font-bold tracking-wide hover:bg-gray-900 hover:text-orange-400 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              Add More Images
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

          <div className="bg-orange-500 px-6 py-4 flex items-center gap-3">
            <Sparkles size={16} className="text-white" />
            <span className="text-xs font-bold tracking-[3px] uppercase text-white">
              Item Details
            </span>
          </div>

          <form onSubmit={submitForm} className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-gray-800">
                  <Tag size={12} className="text-orange-500" />
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sony Headphones"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-gray-800">
                  <Tag size={12} className="text-orange-500" />
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option value={c.id} key={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-1.5 text-[11px] font-bold tracking-[2px] uppercase text-gray-800">
                  <FaRupeeSign className="text-orange-500 text-xs" />
                  Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-gray-800">
                  <Clock size={12} className="text-orange-500" />
                  Item Age
                </label>
                <input
                  type="text"
                  placeholder="e.g. 6 months"
                  value={form.itemAge}
                  onChange={(e) => setForm({ ...form, itemAge: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-gray-800">
                  <Sparkles size={12} className="text-orange-500" />
                  Condition
                </label>
                <input
                  type="text"
                  placeholder="New / Good / Used"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-gray-800">
                <AlignLeft size={12} className="text-orange-500" />
                Description
              </label>
              <textarea
                placeholder="e.g. It is a bit old but works perfectly fine, no damage at all..."
                value={form.description}
                rows={4}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all resize-none"
              />
            </div>

            <div className="h-px bg-gray-100" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <label
                className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  form.isNegotiable
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">Negotiable</p>
                  <p className="text-xs text-gray-400 mt-0.5">Allow buyers to bargain</p>
                </div>
                <div className="relative w-11 h-6">
                  <input
                    type="checkbox"
                    checked={form.isNegotiable}
                    onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${form.isNegotiable ? "bg-orange-500" : "bg-gray-300"}`} />
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform duration-200 ${form.isNegotiable ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>

              <label
                className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  form.forExchange
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/40"
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">Open to Exchange</p>
                  <p className="text-xs text-gray-400 mt-0.5">Swap with other products</p>
                </div>
                <div className="relative w-11 h-6">
                  <input
                    type="checkbox"
                    checked={form.forExchange}
                    onChange={(e) => setForm({ ...form, forExchange: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${form.forExchange ? "bg-orange-500" : "bg-gray-300"}`} />
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform duration-200 ${form.forExchange ? "translate-x-5" : "translate-x-0.5"}`} />
                </div>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-orange-500 text-white font-bold py-4 rounded-xl text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group shadow-md mt-2"
            >
              Post Item
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </button>

          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default AddItem;