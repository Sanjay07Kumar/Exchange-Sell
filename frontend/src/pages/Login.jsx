import React from 'react';
import {useState,useRef} from 'react';
import { useNavigate } from 'react-router-dom';

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
            const text=await response.text();
            console.log("Logged In Successfully" , {email,password});

            if(!response.ok) {
                setError(text);
                return;
            }

            const data =JSON.parse(text);
            localStorage.setItem=("Token" ,data.token);
            console.log("Login SuccessFull");
            navigate("/");

        } catch(err) {
            setError("Failed to Login. Please try again later.");
        } finally {
            setLoading(false);
        }
        
    };

    return (
    <div className='h-screen flex items-center justify-center'>
        <div className='w-96 bg-white p-8 rounded-xl mx-auto'>
          
          <h1 className='text-2xl font-bold mb-6 text-center'>Login</h1>

          {error && (
            <div>
                <p role="alert" className='mb-10 text-red-500'>
                    {error}
                </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <label htmlFor='email' className='block mb-2 font-medium text-gray-600'>
                Email
            </label>

            <input
                ref={emailRef}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email'
                className='w-full p-2 mb-6 rounded-md bg-gray-100'
                required
            />

            <label htmlFor='password' className='block mb-2 font-medium text-gray-600'>
                Password
            </label>

            <input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                className='w-full p-2 mb-6 rounded-md bg-gray-100'
                required
            />

            <button
                type="submit"
                disabled={loading}
                className='w-full bg-orange-500 p-2 rounded-md text-md font-semibold text-white'
            >
                {loading ? "Logging In..." : "Login"}
            </button>

            <p className='font-sm text-black text-center mt-3'>Don't have an account? <a href='/register'className='font-sm text-orange-600'>Register here!</a></p>

          </form>

        </div>
    </div>
    )
}
