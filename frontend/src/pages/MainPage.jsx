import { useState, useEffect } from "react";
import axios from "axios";

export default function MainPage() {


     
    const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/categories/all")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const fetchRecentItems = async () => {
    try {
      const response = await axios.get("http://localhost:8080/items/all");
      setRecentItems(response.data); // store in state
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };












  
  const banners = [
    "https://picsum.photos/1500/500?random=1",
    "https://picsum.photos/1500/500?random=2",
    "https://picsum.photos/1500/500?random=3",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const slider = setInterval(() => {
      setIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(slider);
  }, []);

  


//   const trending = [
//     { name: "T-Shirt", img: "https://picsum.photos/300?1" },
//     { name: "Sneakers", img: "https://picsum.photos/300?2" },
//     { name: "Hoodie", img: "https://picsum.photos/300?3" },
//     { name: "Watch", img: "https://picsum.photos/300?4" },
//     { name: "Backpack", img: "https://picsum.photos/300?5" },
//     { name: "Jeans", img: "https://picsum.photos/300?6" },
//   ];

  return (
    <div className="w-full bg-gray-100 min-h-screen mt-[70px]">

      

      <div className="w-[95%] mt-[80px] mx-auto mb-2 bg-white p-5 shadow-md">


      <div className="flex flex-wrap justify-center gap-10">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex flex-col mt-2 items-center cursor-pointer hover:scale-105 transition-transform"
          >
            <img
              src={`https://picsum.photos/100?random=${cat.id}`}
              alt={cat.name}
              className="w-24 h-24 object-cover shadow"
            />

            <p className="mt-2 text-sm font-semibold">{cat.name}</p>
            <p className="text-sm text-gray-700">{cat.productCount} products</p>
          </div>
        ))}
      </div>

    </div>

      {/* ---------------- HERO SLIDER ---------------- */}
      <div className="w-full ">
        <img
          src={banners[index]}
          alt="banner"
          className="w-[97%] mx-auto h-[250px] object-cover mt-5 transition-all duration-700 "
        />
      </div>


      <div className="max-w-7xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold mb-4">Recently Posted</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {recentItems.map((item, index) => (
          <div
            key={index}
            className="shadow rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer bg-white"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <p className="font-semibold text-center  text-sm truncate">{item.name}</p>
              <p className="text-gray-600 text-center text-sm">₹{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

      {/* ---------------- TRENDING SECTION ---------------- */}
      {/* <div className="max-w-7xl mx-auto mt-12 px-4">
        <h2 className="text-2xl font-bold mb-4">Trending Now</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {trending.map((prod, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 hover:shadow-lg cursor-pointer">
              <img
                src={prod.img}
                alt={prod.name}
                className="w-full h-40 object-cover rounded-md"
              />
              <p className="text-center mt-2 font-medium">{prod.name}</p>
            </div>
          ))}
        </div>
      </div> */}

      {/* ---------------- FOOTER ---------------- */}
      <div className="w-full bg-gray-800 mt-10 py-8 text-center text-white">
        © 2025 ExSell. Made for learning and projects.
      </div>

    </div>
  );
}
