import React, { useState, useEffect } from 'react';
import { User, Mail, Save, Edit, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ClientProfile = () => {
  const [profile, setProfile] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    getClientProfile();
  }, []);

  const getClientProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/clients/profile', {
        withCredentials: true
      });
      setProfile({
        email: response.data.email,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Error loading profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (profile.password && profile.password !== profile.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (profile.password && profile.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      const updateData = { email: profile.email };
      
      // Only include password if it's being changed
      if (profile.password) {
        updateData.password = profile.password;
      }

      const response = await axios.put('http://localhost:5000/api/clients/profile', updateData, {
        withCredentials: true
      });

      if (response.status === 200) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setProfile(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error updating profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfile(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
    getClientProfile();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Client Account</h2>
              
              </div>
            </div>
          </div>
          {/* Account Information */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Account Type</p>
                <p className="font-medium text-gray-900">Client</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-green-600">Active</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="font-medium text-gray-900">January 2024</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
