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
    ...(profile.role === "admin" || profile.role === "manager"
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
          <button
            onClick={() => setTogglePassword(true)}
            className=" bg-gray-200 cursor-pointer text-gray-600 px-4 py-2 mx-4 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center space-x-2"
          >
            <UserPen />
            <span>Update Password</span>
          </button>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={""}
            className="bg-[#1E40AF] cursor-pointer text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <span> {isLoading ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>
      {/* Update Password */}
      {togglePassword && (
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
              onClick={""}
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
  });



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
          <button
            onClick={showModal}
            className="bg-[#1E40AF] cursor-pointer text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
          >
            <span>Add User</span>
          </button>
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
                    <button
                      onClick={() => handleViewUser(user)}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full hover:bg-blue-200 transition"
                    >
                      View
                    </button>
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

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
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
