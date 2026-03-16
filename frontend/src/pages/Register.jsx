import React from 'react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {

    const [email,setEmail]=useState("");
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const [error,setError]=useState("");
    const emailRef=useRef(null);
    const [loading,setLoading]=useState(false);
    
    const navigate =useNavigate();

    const validate = () =>{
        if(!username.trim()) return "Username is Required";
        if(!email.trim()) return "Email is Required";
        if(password.length < 8 ) return "Password must be at least 8 Characters Long";
        return "";
    }

    const handleSubmit = async (e) =>{
        e.preventDefault();
        setError("");

        const v=validate();
        if(v) {
            setError(v);
            return;
        }

        setLoading(true);

        try {
            const response=await fetch("http://localhost:8080/user/register" ,{
                method:"POST" ,
                headers: {"Content-type" :"application/json"},
                body: JSON.stringify({username,email,password}),
            });

            const text=await response.text();

            if(!response.ok) {
                setError(text);
            }
            else {
                navigate("/login");
            }

        } catch (err) {
            setError("Failed to Register.Please try again");
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="min-h-screen flex bg-gray-100">

            {/* LEFT SIDE */}
            <div className="hidden lg:flex w-1/2 bg-orange-500 text-white flex-col justify-center px-16">

                <h1 className="text-5xl font-bold mb-6">
                    ExSell
                </h1>

                <p className="text-lg mb-10 max-w-md opacity-90">
                    Create your account and start exploring thousands of
                    products. Chat with sellers and enjoy seamless shopping.
                </p>

                <div className="space-y-4 text-sm opacity-90">

                    <div className="flex items-center gap-3">
                        <span className="text-xl">🛒</span>
                        <p>Shop online and get your favorite products</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xl">💬</span>
                        <p>Chat with sellers instantly</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-xl">🔒</span>
                        <p>Secure and protected accounts</p>
                    </div>

                </div>

            </div>


            {/* RIGHT SIDE */}
            <div className="flex flex-1 items-center justify-center p-6">

                <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10">

                    <h2 className="text-3xl font-bold text-center mb-2">
                        Create Account
                    </h2>

                    <p className="text-center text-gray-500 mb-8">
                        Join ExSell today
                    </p>


                    {error && (
                        <p role="alert" className="mb-6 text-red-500 text-center">
                            {error}
                        </p>
                    )}


                    <form onSubmit={handleSubmit} noValidate>

                        {/* USERNAME */}
                        <label className="block mb-2 text-sm font-medium text-gray-600">
                            Username
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            className="w-full p-3 mb-6 rounded-lg bg-gray-100 focus:ring-2 focus:ring-orange-500 outline-none"
                            required
                        />


                        {/* EMAIL */}
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


                        {/* PASSWORD */}
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


                        {/* BUTTON */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 p-3 rounded-lg text-white font-semibold hover:bg-orange-400 transition"
                        >
                            {loading ? "Signing up..." : "Sign Up"}
                        </button>


                        {/* LOGIN LINK */}
                        <p className="text-sm text-center mt-6">
                            Already have an account?
                            <a href="/login" className="text-orange-600 ml-1 font-medium hover:underline">
                                Login here
                            </a>
                        </p>

                    </form>

                </div>

            </div>

        </div>
    );
}
