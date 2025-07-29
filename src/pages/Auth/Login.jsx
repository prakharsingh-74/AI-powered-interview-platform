import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';

const Login = ({setcurrentPage}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const Navigate = useNavigate();
  // login logic
  const handleLogin = (e) => {
    e.preventDefault();

    if (!validateEmail(email)){
      setError("Please enter a valid email address.")
      return;
    }

    if (!password){
      setError("Please enter the password")
      return;
    }

    setError("");
    
    //login API call
    try {
      
    } catch (error) {
      if (error.response && error.response.data.message){
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again")
      }
    }
  };

  return <div className='w-[90vw] md:w-[33vw] p-7 flex flex-col justify-center'>
      <h3 className='text-lg font-semibold text-black'>Welcome Back</h3>
      <p className='text-xs text-slate-700 mt-[5px] mb-6'>
        Please enter your credentials to login.
      </p>

      <form onSubmit={handleLogin}>
        <Input
          value={email}
          onchange={({target}) => setEmail(target.value)}
          label='Email address'
          placeholder='abc@example.com'
          type='text'
        />
        <Input
          value={password}
          onchange={({target}) => setPassword(target.value)}
          label='Password'
          placeholder='Minimum 8 characters'
          type='password'
        />

        {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

        <button type='submit' className='btn-primary'>
            LOGIN
        </button>

        <p className='text-[13px] text-slate-800 mt-3'>
          Don't have an account?{' '}
          <button
            className='font-medium text-primary underline cursor-pointer'
            onClick={()=>{
              setcurrentPage("signup");
            }}
          >
            SignUp
          </button>
        </p>
      </form>
  </div>
}

export default Login