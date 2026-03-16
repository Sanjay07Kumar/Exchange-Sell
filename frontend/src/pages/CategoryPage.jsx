import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Footer from "./Footer";
import { getAuthToken } from "../utils/tokenUtils";

export default function CategoryPage() {
    const { id } = useParams();

    const [items, setItems] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadCategoryData() {
            try {
                const token = getAuthToken();

                // Headers: add token only if exists
                const headers = token
                    ? { "Authorization": `Bearer ${token}` }
                    : {};

                // Fetch items in the category
                const res = await fetch(`http://localhost:8080/items/category/${id}`, {
                    headers: headers,
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch items. Status: ${res.status}`);
                }

                const itemsData = await res.json();
                setItems(itemsData);

                // Fetch category information
                const catRes = await fetch(`http://localhost:8080/categories/${id}`, {
                    headers: headers,
                });

                const catData = await catRes.json();
                setCategory(catData);

            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        }

        loadCategoryData();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-20 text-xl font-semibold">Loading...</div>;
    }

    

    return (
        <div>
            <div className="p-6 mt-[60px]">
                <h1 className="text-2xl font-bold mb-5">{category?.name}</h1>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {items.map(item => (
                        
                        <div
                            key={item.id}
                            className="bg-white shadow p-3 hover:scale-105 cursor-pointer"
                            onClick={() => window.location.href = `/items/${item.id}`}
                        >
                            <img
                                src={item.imageUrls && item.imageUrls.length > 0 ? `http://localhost:8080${item.imageUrls[0]}` : "/no-image.png"}
                                onError={(e) => e.target.src = "/no-image.png"}
                                className="w-full h-20 md:h-40 lg:h-40 object-contain bg-white"
                                alt={item.name}
                            />
                            <p className="font-semibold text-center text-sm mt-2 truncate">{item.name}</p>
                            <p className="text-center text-xs text-gray-600">₹{item.price}</p>
                        </div>
                    ))}
                </div>

            </div>
                <Footer/>
          </div>
    );
}
