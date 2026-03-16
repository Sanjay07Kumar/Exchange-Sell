import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import Footer from "./Footer";
import { isTokenExpired, getAuthToken } from "../utils/tokenUtils";

function AddItem() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(Array(6).fill(null)); // 6 image boxes initially
  
 const isLoggedIn = !!localStorage.getItem("Token") && !isTokenExpired();

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

  // Load categories
  useEffect(() => {
    axios.get("http://localhost:8080/categories/all").then((res) => {
      setCategories(res.data);
    });
  }, []);

  // Add extra blank image box
  const handleAddMoreBox = () => {
    setImages([...images, null]);
  };

  // When user selects an image
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

  // Submit form + images
  const submitForm = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthToken();
      
      if (!token) {
        alert("Please login first!");
        return;
      }

      const formData = new FormData();

      // Append text fields
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Append images
      images.forEach((img) => {
        if (img?.file) formData.append("images", img.file);
      });

      const response = await axios.post("http://localhost:8080/items/add-items",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  if(!isLoggedIn) return null;

  return (
    <div className="w-full mt-[70px] mx-auto">

      <h1 className="text-4xl font-extrabold text-center mb-6 tracking-wide">
        Post an Item
      </h1>
    <div className="flex">
      <div className="flex flex-col md:flex-row mx-auto p-10 gap-10">

      <div className="bg-white w-[500px]">
        <h2 className="text-xl font-bold mb-3 p-5 ">Upload Product Images</h2>

        <div className="grid grid-cols-3 gap-3 p-5 ">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => openFilePicker(index)}
              className="w-36 h-36 border-2 border-dashed  border-gray-500 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition relative"
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
                  className="w-full h-full rounded-xl object-cover"
                  alt="preview"
                />
              ) : (
                <div className="flex flex-col items-center text-orange-500 hover:text-orange-500">
                  <Plus size={34} />
                  <p className="text-xs mt-1">Upload</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          className="mt-3 p-3 ml-5 mx-auto bg-orange-500 font-semibold text-white rounded-lg hover:bg-orange-600 shadow-md"
          onClick={handleAddMoreBox}
        >
          + Add More Images
        </button>

      </div>
      
      <div className="bg-white w-[700px] p-5">
        {/* FORM SECTION */}
        <form onSubmit={submitForm} className="mt-8 space-y-4">

        <div className="flex gap-10"> 
          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Item Name :
            </h2>
            <input
            type="text"
            placeholder="Item Name"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border p-3 rounded-lg shadow-sm"
          />
          </div>
          
          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Choose Category :
            </h2>
            <select
            className="w-full border p-3 rounded-lg shadow-sm"
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            <option>Select Category</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>{c.name}</option>
            ))}
          </select>
          </div>
        
        </div>
          
          <div>
            <h2 className="flex font-bold text-gray-800 mb-2">
              <FaRupeeSign/>Price :
            </h2>
            <input
            type="number"
            placeholder="Price"
            className="w-fit border p-3 rounded-lg shadow-sm"
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          </div>
          
          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Description :
            </h2>
            <textarea
            placeholder="e.g.  It is a bit old. But it works well and not damaged."
            className="w-full border p-3 rounded-lg shadow-sm"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          </div>
          
          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Item age :
            </h2>
            <input
            type="text"
            placeholder="(e.g. 6 months)"
            className="w-fit border p-3 rounded-lg shadow-sm"
            onChange={(e) => setForm({ ...form, itemAge: e.target.value })}
          />
          </div>


          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Condition :
            </h2>
            <input
            type="text"
            placeholder="e.g. (New / Good / Used)"
            className="border w-fit p-3 rounded-lg shadow-sm"
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          />
          </div>

          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Let others negotiate with you?
            </h2>
              <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })}
                className=""
              />
              Negotiable
            </label>
          </div>


          <div>
            <h2 className="font-bold text-gray-800 mb-2">
              Want to able to exchange this for others products?
            </h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => setForm({ ...form, forExchange: e.target.checked })}
              />
              Available For Exchange
            </label>
          </div>
          


          <button className="w-fit bg-orange-500 font-semibold mx-auto text-white px-6 py-3 rounded-lg text-lg mt-4 hover:bg-orange-600 shadow-lg">
            Add Item
          </button>
        </form>
      </div>
      
      </div>
      </div>
      <Footer/>
    </div>
  );
}

export default AddItem;
