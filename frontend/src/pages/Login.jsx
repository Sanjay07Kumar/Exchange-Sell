import React from 'react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuthToken } from '../utils/tokenUtils';

export default function Login() {

    const [email,setEmail] =useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(false);
    const emailRef=useRef(null);
    
    const navigate=useNavigate();

    const validate = () =>{
        if(!email.trim()) return "Email is Required";
        if(password.length < 8 ) return "Password must be at least 8 Characters Long";
        return "";
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const v = validate();
        if(v) {
            setError(v);
            if(v.toLowerCase().includes("email") && emailRef.current ) {
                emailRef.current.focus();
            }
            return;
        }

        setLoading(true);

        try {
            const response=await fetch("http://localhost:8080/user/login" , {
                method:"POST" ,
                headers :{"content-type" : "application/json"},
                body: JSON.stringify({email,password}),
            });

            const text = await response.text();

            if (!response.ok) {
                setError(text || "Login failed. Please check your credentials.");
                return;
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                setError("Login failed: invalid server response.");
                return;
            }

            if (!data?.token) {
                setError("Login failed: missing token from server.");
                return;
            }

            saveAuthToken(data.token, data.id);
            navigate("/", { replace: true });

        } catch(err) {
            setError("Failed to Login. Please try again later.");
        } finally {
            setLoading(false);
        }
        
    };

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 bg-orange-500 text-white flex-col justify-center px-16">

                <h1 className="text-5xl font-bold mb-6">
                    ExSELL
                </h1>

                <p className="text-lg mb-10 max-w-md opacity-90">
                    Discover amazing products, chat with sellers instantly,
                    and enjoy a seamless online shopping experience.
                </p>

                <div className="space-y-4 text-sm opacity-90">

                    <div className="flex items-center gap-3">
                        <span className="text-xl">🛒</span>
                        <p>Browse thousands of products</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xl">💬</span>
                        <p>Chat instantly with sellers</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xl">⚡</span>
                        <p>Fast and secure checkout</p>
                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="flex flex-1 items-center justify-center p-6">

                <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10">

                    <h2 className="text-3xl font-bold text-center mb-2">
                        Welcome Back
                    </h2>

                    <p className="text-center text-gray-500 mb-8">
                        Login to continue shopping
                    </p>


                    {error && (
                        <p role="alert" className="mb-6 text-red-500 text-center">
                            {error}
                        </p>
                    )}


                    <form onSubmit={handleSubmit} noValidate>

                        <label className="block mb-2 text-sm font-medium text-gray-600">
                            Email
                        </label>

                        <input
                            ref={emailRef}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full p-3 mb-6 rounded-lg bg-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        />


                        <label className="block mb-2 text-sm font-medium text-gray-600">
                            Password
                        </label>

                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full p-3 mb-6 rounded-lg bg-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        />


                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 p-3 rounded-lg text-white font-semibold hover:bg-orange-400 transition"
                        >
                            {loading ? "Logging In..." : "Login"}
                        </button>


                        <p className="text-sm text-center mt-6">
                            Don't have an account?
                            <a href="/register" className="text-orange-600 ml-1 font-medium hover:underline">
                                Register
                            </a>
                        </p>

                    </form>

                </div>

            </div>

        </div>
    )
}
