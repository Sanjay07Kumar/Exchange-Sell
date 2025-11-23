import React from 'react';
import {useState,useRef} from 'react';
import {useNavigate} from 'react-router-dom';
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
                headers: {"Content-type" :" application/json"},
                body: JSON.stringify({username,email,password}),
            });
            
            console.log("Registered Successfully",{username,email,password} );

            const text=await response.text();

            if(!response.ok) {
                setError(text);
            }
            else {
                // alert("Registered Successfully! Please Login.");
                navigate("/login");
                console.log("Backend Response:", text);
            }
        } catch (err) {
            setError("Failed to Register.Please try again");
        } finally {
            setLoading(false);
        }

    }
    return (
        <div className='h-screen flex items-center justify-center'>
            <div className='w-96 bg-white p-8 rounded-xl mx-auto'>
                
                <h1 className='text-2xl font-bold mb-6 text-center'>Sign up</h1>
                
                {error && (
                    <div>
                        <p role="alert" className='mb-10 text-red-500'>
                            {error}
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor='email' className='block mb-2 font-medium text-gray-600'>
                        Username
                    </label>

                    <input
                        id='username'
                        type='text'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder='Enter Username'
                        className='w-full p-2 mb-6 rounded-md bg-gray-100'
                        required
                    />

                    <label htmlFor='email' className='block mb-2 font-medium text-gray-600'>
                        Email
                    </label>

                    <input
                        ref={emailRef}
                        id='email'
                        type='email'
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
                        id='password'
                        type='password'
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
                        {loading? "Signing up..." : "Sign up"}
                    </button>


                    <p className='font-sm text-black text-center mt-3'>Already have an account? <a href='/login'className='font-sm text-orange-600'>Login here!</a></p>
                </form>
            </div>
        </div>
    );
}