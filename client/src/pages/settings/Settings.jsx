import { EyeIcon, Save, UserPen } from "lucide-react";
import React, { useState } from "react";
import { Modal } from "antd";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect } from "react";
import dayjs from "dayjs";
import api from "../../../api";
const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [profile, setProfile] = useState({});
  const [togglePassword, setTogglePassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");


  const [filterValue, setFilterValue] = useState("all");
  const [emailFilter, setEmailFilter] = useState("");
  // Update Password

  const validateMatch = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return false;
    }
    return true;
  };

  //   const updatePassword = async () => {
  //     if (!validateMatch(newPassword, confirmPassword)) {
  //       toast.error("Passwords do not match");
  //       return;
  //     }
  //     try {
  //       setIsLoading(true);
  //       const response = await api.patch(
  //         "/update-password",
  //         {
  //           currentPassword,
  //           newPassword,
  //         },
  //       );
  //       if (response.status === 200) {
  //         toast.success("Password updated successfully");
  //         setIsLoading(false);
  //         setCurrentPassword("");
  //         setNewPassword("");
  //         setConfirmPassword("");
  //       }
  //     } catch (error) {
  //       toast.error("Error when try to update password");
  //       console.error(error);
  //       setIsLoading(false);
  //     }
  //   };

  //   const updateEmail = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await api.patch("/update-profile", {
  //         email: profile.email,
  //       });
  //       if (response.status === 200) {
  //         toast.success("Email updated successfully");
  //         setIsLoading(false);
  //       }
  //     } catch (error) {
  //       toast.error("Error when try to update email");
  //       console.error(error);
  //       setIsLoading(false);
  //     }
  //   };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setUser({
      email: "",
      password: "",
      role: "admin",
    });
  };

  const getConnectedUser = async () => {
    try {
      const response = await api.get("/api/auth/me", { withCredentials: true });
      setProfile(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getConnectedUser();
  }, []);

  const [user, setUser] = useState({
    email: "",
    password: "",
    role: "admin",
  });

  const handleInputChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });
  };

  const createUser = async () => {
    try {
      setIsLoading(true);

      // Use different endpoints based on role
      let endpoint = "/api/auth/add-user";
      if (user.role === "client") {
        endpoint = "/api/clients/create";
      }

      const response = await api.post(endpoint, user, {
        withCredentials: true,
      });
      if (response.status === 201) {
        setIsModalOpen(false);
        toast.success("User created successfully");
        getStaffMembers();
        setUser({
          email: "",
          password: "",
          role: "admin",
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error when try to create user");
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: "Settings" },
    ...(profile.role === "admin" || profile.role === "manager" || profile.role === "candidateService"
      ? [{ id: "users", label: "Users & Permissions", icon: "Users" }]
      : []),
  ];

  const getStaffMembers = async () => {
    try {
      const response = await api.get("/api/auth/all-users", {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getStaffMembers();
  }, []);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Personal Information
          </h3>
          {(profile.role === "admin" || profile.role === "manager") && (
            <button
              onClick={() => setTogglePassword(true)}
              className=" bg-gray-200 cursor-pointer text-gray-600 px-4 py-2 mx-4 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
            >
              <UserPen />
              <span>Update Password</span>
            </button>
          )}
        </div>
        {/* Member since / Last updated */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Membre depuis</p>
            <p className="font-medium text-gray-900">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Dernière mise à jour</p>
            <p className="font-medium text-gray-900">
              {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </p>
          </div>
        </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              onChange={handleInputChange}
              value={profile.email}
              disabled={profile.role === "candidateService"}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${profile.role === "candidateService" ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="relative">
              <input
                type="text"
                name="role"
                disabled
                defaultValue={profile.role}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
              />
            </div>
          </div>
        </div>
        {/* Save Button */}
        {(profile.role === "admin" || profile.role === "manager") && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const payload = { email: profile.email };
                  const response = await api.patch(
                    "/api/auth/me",
                    payload,
                    { withCredentials: true }
                  );
                  if (response.status === 200) {
                    toast.success("Profile updated successfully");
                    setProfile(response.data);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(error.response?.data?.message || "Error when try to update profile");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="bg-[#1E40AF] cursor-pointer text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span> {isLoading ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
        {profile.role === "candidateService" && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              En tant que candidateService, vous ne pouvez pas modifier vos informations personnelles. 
              Contactez un administrateur pour toute modification nécessaire.
            </p>
          </div>
        )}
      </div>
      {/* Update Password */}
      {togglePassword && (profile.role === "admin" || profile.role === "manager") && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    value={currentPassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    onChange={(event) => setNewPassword(event.target.value)}
                    value={newPassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    value={confirmPassword}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setTogglePassword(false)}
              className="bg-gray-200 cursor-pointer text-gray-600 px-4 py-2 mx-4 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!validateMatch(newPassword, confirmPassword)) {
                  toast.error("Passwords do not match");
                  return;
                }
                if (newPassword && newPassword.length < 6) {
                  toast.error("Password must be at least 6 characters long");
                  return;
                }
                try {
                  setIsLoading(true);
                  const payload = { currentPassword, newPassword };
                  const response = await api.patch("/api/auth/me", payload, { withCredentials: true });
                  if (response.status === 200) {
                    toast.success("Password updated successfully");
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setTogglePassword(false);
                  }
                } catch (error) {
                  console.error(error);
                  toast.error(error.response?.data?.message || "Error when try to update password");
                } finally {
                  setIsLoading(false);
                }
              }}
              className="bg-[#1E40AF] cursor-pointer text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );


  const filteredUsers = users.filter((user) => {
    if (filterValue === "all") {
      return true;
    } else if (filterValue === "staff") {
      return user.role === "admin" || user.role === "manager" || user.role === "customerService" || user.role === "candidateService" || user.role === "resumeService";
    } else if (filterValue === "clients") {
      return user.role === "client";
    }
    return false;
  }).filter(u => emailFilter.trim() === '' || (u.email && u.email.toLowerCase().includes(emailFilter.trim().toLowerCase())));



  const renderUsersSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Filter by role */}
          <div className="flex flex-col items-start space-y-2">

          <label htmlFor="" className="">Filter by role</label>
          <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" name="" id="" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}>
            <option value="all">All</option>
            <option value="staff">Staff members</option>
            <option value="clients">Clients</option>
          </select>
          </div>
          {/* Filter by email */}
          <div className="flex flex-col items-start space-y-2">
            <label className="">Filter by email</label>
            <input
              type="text"
              placeholder="email contains..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          {(profile.role === "admin" || profile.role === "manager") && (
            <button
              onClick={showModal}
              className="bg-[#1E40AF] cursor-pointer text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <span>Add User</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          {filteredUsers?.map((user) => (
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"></div>
                <div key={user.id}>
                  <p className="font-medium text-gray-900">{user.email}</p>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Active
                </span>
                {user.role !== "manager" ? (
                  <>
                    {(profile.role === "admin" || profile.role === "manager") && (
                      <button
                        onClick={() => handleViewUser(user)}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition"
                      >
                        View
                      </button>
                    )}
                    {user.role === 'client' && (
                      <button
                        onClick={() => handleOpenSuivi(user)}
                        className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full hover:bg-purple-200 transition"
                      >
                        Suivi
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "users":
        return renderUsersSettings();
      default:
        return renderGeneralSettings();
    }
  };

  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSuiviModalOpen, setIsSuiviModalOpen] = useState(false);
  const [suivi, setSuivi] = useState(null);
  const [suiviLoading, setSuiviLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null); // backward compat
  const [lmFile, setLmFile] = useState(null); // backward compat
  const [cvFiles, setCvFiles] = useState([]);
  const [lmFiles, setLmFiles] = useState([]);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };
  const handleOpenSuivi = async (user) => {
    setSelectedUser(user);
    setIsSuiviModalOpen(true);
    setSuiviLoading(true);
    try {
      const res = await api.get(`/api/suivi/${user._id}`, { withCredentials: true });
      setSuivi(res.data);
    } catch (e) {
      // initialize defaults if not found
      setSuivi({
        user: user._id,
        consultationValidated: false,
        paymentReceived: false,
        destination: '',
        cvLetterCreated: false,
        cvFile: '',
        lmFile: '',
        applicationNotes: ''
      });
    } finally {
      setSuiviLoading(false);
    }
  };
  const deleteUser = async (id) => {
    try {
      setIsLoading(true);
      const response = await api.delete(`/api/clients/delete-user/${id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success("User deleted successfully");
        setIsViewModalOpen(false);
        getStaffMembers(); // Refresh list
      }
    } catch (error) {
      console.error(error);
      toast.error("Error deleting user");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async () => {
  try {
    setIsLoading(true);

    // Only send password if the admin entered one
    const payload = {
      email: selectedUser.email,
      role: selectedUser.role,
    };

    if (selectedUser.password && selectedUser.password.trim() !== "") {
      payload.password = selectedUser.password;
    }

    const response = await api.patch(
      `/api/clients/update-user/${selectedUser._id}`,
      payload,
      { withCredentials: true }
    );

    if (response.status === 200) {
      toast.success("User updated successfully");
      setIsViewModalOpen(false);
      getStaffMembers();
    }
  } catch (error) {
    console.error(error);
    toast.error("Error updating user");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 rounded-lg shadow border border-gray-300 p-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">
              Manage your account preferences and system configuration
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Settings Navigation */}
            <div className="lg:w-1/4">
              <nav className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 text-left ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-[#1E40AF] border border-blue-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Settings Content */}
            <div className="lg:w-3/4">{renderTabContent()}</div>
          </div>
        </div>
      </div>
      <Modal
        title="Add User"
        closable={{ "aria-label": "Custom Close Button" }}
        open={isModalOpen}
        onOk={createUser}
        onCancel={handleCancel}
        okText={isLoading ? "Saving..." : "Save"}
      >
        <form action="" className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email address{" "}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full rounded border border-gray-200 focus:border-gray-400 outline-0 p-2 "
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              Password{" "}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full rounded border border-gray-200 focus:border-gray-400 outline-0 p-2 "
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium">
              Role{" "}
            </label>
            <select
              id="role"
              name="role"
              required
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
              className="w-full rounded border border-gray-200 focus:border-gray-400 outline-0 p-2 "
            >
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
              <option value="customerService">Service Consultation</option>
              <option value="candidateService">Service Dossier</option>
              <option value="resumeService">Service C.V</option>
              <option value="client">Client</option>
              {/* <option value="SUPERADMIN">Super Admin</option> */}
            </select>
          </div>
        </form>
      </Modal>
      <Modal
        title="Update Client Suivi"
        open={isSuiviModalOpen}
        onCancel={() => { setIsSuiviModalOpen(false); setSuivi(null); setCvFile(null); setLmFile(null); }}
        footer={null}
      >
        {suiviLoading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : suivi ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Consultation gratuite</p>
                <p className="text-sm text-gray-500">Valider ou annuler la consultation</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const newValue = !suivi.consultationValidated;
                    const res = await api.patch(`/api/suivi/${selectedUser._id}`, { consultationValidated: newValue }, { withCredentials: true });
                    setSuivi(res.data);
                    toast.success(newValue ? 'Consultation validée' : 'Consultation annulée');
                  } catch (e) { toast.error('Erreur de mise à jour'); }
                }}
                className={`px-3 py-1 rounded ${suivi.consultationValidated ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
              >
                {suivi.consultationValidated ? 'Validé ✓' : 'Non validé'}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Paiement reçu</p>
                <p className="text-sm text-gray-500">Valider ou annuler la réception du paiement</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const newValue = !suivi.paymentReceived;
                    const res = await api.patch(`/api/suivi/${selectedUser._id}`, { paymentReceived: newValue }, { withCredentials: true });
                    setSuivi(res.data);
                    toast.success(newValue ? 'Paiement validé' : 'Paiement annulé');
                  } catch (e) { toast.error('Erreur de mise à jour'); }
                }}
                className={`px-3 py-1 rounded ${suivi.paymentReceived ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
              >
                {suivi.paymentReceived ? 'Validé ✓' : 'Non validé'}
              </button>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={suivi.destination || ''}
                  onChange={(e) => setSuivi({ ...suivi, destination: e.target.value })}
                  className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await api.patch(`/api/suivi/${selectedUser._id}`, { destination: suivi.destination }, { withCredentials: true });
                      setSuivi(res.data);
                      toast.success('Destination mise à jour');
                    } catch (e) { toast.error('Erreur de mise à jour'); }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Enregistrer
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Création CV et Lettre</p>
                <button
                  onClick={async () => {
                    try {
                      const newValue = !suivi.cvLetterCreated;
                      const res = await api.patch(`/api/suivi/${selectedUser._id}`, { cvLetterCreated: newValue }, { withCredentials: true });
                      setSuivi(res.data);
                      toast.success(newValue ? 'Statut validé' : 'Statut annulé');
                    } catch (e) { toast.error('Erreur de mise à jour'); }
                  }}
                  className={`px-3 py-1 rounded text-sm ${suivi.cvLetterCreated ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-400 text-white hover:bg-gray-500'}`}
                >
                  {suivi.cvLetterCreated ? 'Validé ✓' : 'Non validé'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">CV (Curriculum Vitae)</label>
                  <input 
                    multiple 
                    type="file" 
                    id="cv-upload"
                    accept=".pdf,.doc,.docx,.txt" 
                    onChange={(e) => { 
                      const files = Array.from(e.target.files || []);
                      setCvFiles(files); 
                      setCvFile(null); 
                    }} 
                    className="block w-full text-sm border border-gray-300 rounded-md p-2 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                  />
                  {cvFiles.length > 0 ? (
                    <p className="text-xs text-green-600 mt-1">{cvFiles.length} fichier(s) sélectionné(s) - prêt à téléverser</p>
                  ) : null}
                  
                  {/* Existing uploaded files */}
                  {Array.isArray(suivi.cvFiles) && suivi.cvFiles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Fichiers téléversés:</p>
                      <div className="space-y-1">
                        {suivi.cvFiles.map((file, idx) => (
                          <div key={`cv-${idx}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-gray-700 text-xs flex-1 truncate" title={file.split('/').pop()}>
                              CV {idx + 1} - {file.split('/').pop()}
                            </span>
                            <div className="flex items-center gap-1">
                              <a 
                                href={`${api.defaults.baseURL}${file}`} 
                                download
                                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-600 rounded hover:bg-blue-50"
                              >
                                📥
                              </a>
                              <button
                                onClick={async () => {
                                  if (confirm('Supprimer ce fichier?')) {
                                    try {
                                      await api.delete(`/api/suivi/${selectedUser._id}/file`, {
                                        data: { filePath: file, fileType: 'cv' },
                                        withCredentials: true
                                      });
                                      const res = await api.get(`/api/suivi/${selectedUser._id}`, { withCredentials: true });
                                      setSuivi(res.data);
                                      toast.success('Fichier supprimé');
                                    } catch (e) { toast.error('Erreur suppression'); }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Lettre de motivation</label>
                  <input 
                    multiple 
                    type="file" 
                    id="lm-upload"
                    accept=".pdf,.doc,.docx,.txt" 
                    onChange={(e) => { 
                      const files = Array.from(e.target.files || []);
                      setLmFiles(files); 
                      setLmFile(null); 
                    }} 
                    className="block w-full text-sm border border-gray-300 rounded-md p-2 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
                  />
                  {lmFiles.length > 0 ? (
                    <p className="text-xs text-green-600 mt-1">{lmFiles.length} fichier(s) sélectionné(s) - prêt à téléverser</p>
                  ) : null}
                  
                  {/* Existing uploaded files */}
                  {Array.isArray(suivi.lmFiles) && suivi.lmFiles.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Fichiers téléversés:</p>
                      <div className="space-y-1">
                        {suivi.lmFiles.map((file, idx) => (
                          <div key={`lm-${idx}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-gray-700 text-xs flex-1 truncate" title={file.split('/').pop()}>
                              LM {idx + 1} - {file.split('/').pop()}
                            </span>
                            <div className="flex items-center gap-1">
                              <a 
                                href={`${api.defaults.baseURL}${file}`} 
                                download
                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-600 rounded hover:bg-green-50"
                              >
                                📥
                              </a>
                              <button
                                onClick={async () => {
                                  if (confirm('Supprimer ce fichier?')) {
                                    try {
                                      await api.delete(`/api/suivi/${selectedUser._id}/file`, {
                                        data: { filePath: file, fileType: 'lm' },
                                        withCredentials: true
                                      });
                                      const res = await api.get(`/api/suivi/${selectedUser._id}`, { withCredentials: true });
                                      setSuivi(res.data);
                                      toast.success('Fichier supprimé');
                                    } catch (e) { toast.error('Erreur suppression'); }
                                  }
                                }}
                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-600 rounded hover:bg-red-50"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {(cvFile || lmFile || (cvFiles && cvFiles.length > 0) || (lmFiles && lmFiles.length > 0)) ? (
                <button
                  onClick={async () => {
                    try {
                      setSuiviLoading(true);
                      const form = new FormData();
                      // Backward compat single selections
                      if (cvFile) { form.append('cvFile', cvFile); }
                      if (lmFile) { form.append('lmFile', lmFile); }
                      // Multiple selections
                      if (cvFiles && cvFiles.length) {
                        cvFiles.forEach(f => form.append('cvFile', f));
                      }
                      if (lmFiles && lmFiles.length) {
                        lmFiles.forEach(f => form.append('lmFile', f));
                      }
                      
                      const res = await api.patch(`/api/suivi/${selectedUser._id}`, form, {
                        withCredentials: true,
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      
                      setSuivi(res.data);
                      setCvFile(null);
                      setLmFile(null);
                      setCvFiles([]);
                      setLmFiles([]);
                      // Reset file inputs
                      document.querySelectorAll('input[type="file"]').forEach(input => input.value = '');
                      toast.success('Fichiers téléversés avec succès');
                    } catch (e) { 
                      console.error('Upload error:', e);
                      toast.error(e.response?.data?.message || "Erreur lors de l'upload"); 
                    } finally {
                      setSuiviLoading(false);
                    }
                  }}
                  disabled={suiviLoading}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {suiviLoading ? 'Téléversement...' : 'Téléverser les fichiers'}
                </button>
              ) : null}
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-1">Postulation</label>
              <textarea
                rows={3}
                value={suivi.applicationNotes || ''}
                onChange={(e) => setSuivi({ ...suivi, applicationNotes: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={async () => {
                    try {
                      const res = await api.patch(`/api/suivi/${selectedUser._id}`, { applicationNotes: suivi.applicationNotes }, { withCredentials: true });
                      setSuivi(res.data);
                      toast.success('Postulation mise à jour');
                    } catch (e) { toast.error('Erreur de mise à jour'); }
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">No data</div>
        )}
      </Modal>

      <Modal
        title="User Details"
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={null}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={selectedUser.email}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, email: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={selectedUser.role}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, role: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              >
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="customerService">Service Consultation</option>
                <option value="candidateService">Service Dossier</option>
                <option value="resumeService">Service C.V</option>
                <option value="client">Client</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={selectedUser.password || ""}
                onChange={(e) =>
                  setSelectedUser({ ...selectedUser, password: e.target.value })
                }
                placeholder="Enter new password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => deleteUser(selectedUser._id)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
              >
                {isLoading ? "Deleting..." : "Delete Account"}
              </button>
              <button
                onClick={updateUser}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                {isLoading ? "Updating..." : "Update Account"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default Settings;
