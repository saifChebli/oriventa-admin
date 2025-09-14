import React from 'react';
import logo from '../../../assets/logo.png'

const LoginHeader = () => {
  return (
    <div className="text-center mb-6">
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <div className="w-40 h-40 flex items-center justify-center">
            <img src={logo} alt="" />
            </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-3xl font-bold mb-2">
        Oriventa Pro Services
      </h1>
      
      {/* Welcome Message */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow ">
        <p className=" font-medium">Welcome Back!</p>
        <p className=" text-sm mt-1">
          Sign in to access your management dashboard
        </p>
      </div>
    </div>
  );
};

export default LoginHeader;