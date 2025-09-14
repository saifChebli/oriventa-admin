import { UserPen, Home, Settings, ArrowLeftSquare, ChevronsLeft, ChevronsRight, LogOut, Users, File, Sun, Moon } from "lucide-react";
import React, { useState } from "react";
import { Link, Outlet , useNavigate } from "react-router-dom";
import logo from '../assets/logo.webp'
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const Layout = () => {

  const router = useNavigate()
  const navigate = useNavigate()

  const { user } = useAuth()

  const allNavItems = [
    { name: "Dashboard", path: "/", icon: <Home /> },
    { name: "Consultations" , path:"/clients-management" , icon: <Users />},
    { name: "Dossiers" , path:"/candidates-management" , icon: <UserPen />},
    { name: "Resume" , path : "/resume-management" , icon : <File />},
    { name: "Settings", path: "/settings", icon: <Settings /> },
    { name: "Logout", path: "/logout", icon: <LogOut /> },
  ];

  // Filter nav items based on role
  let navItems = allNavItems;
  if (user?.role === "customerService") {
    navItems = [
          { name: "Dashboard", path: "/", icon: <Home /> },
          { name: "Consultations", path: "/clients-management", icon: <Users /> },
          { name: "Settings", path: "/settings", icon: <Settings /> },
          { name: "Logout", path: "/logout", icon: <LogOut /> },
    ];
  }

    if (user?.role === "candidateService") {
    navItems = [
          { name: "Dashboard", path: "/", icon: <Home /> },
          { name: "Dossiers", path: "/candidates-management", icon: <Users /> },
          { name: "Settings", path: "/settings", icon: <Settings /> },
          { name: "Logout", path: "/logout", icon: <LogOut /> },
    ];
  }

    if (user?.role === "resumeService") {
    navItems = [
          { name: "Dashboard", path: "/", icon: <Home /> },
          { name: "Resume" , path : "/resume-management" , icon : <File />},
          { name: "Settings", path: "/settings", icon: <Settings /> },
          { name: "Logout", path: "/logout", icon: <LogOut /> },
    ];
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  
    const handleItemClick = (index) => {
    setActiveIndex(index);
     if (navItems[index]?.name === "Logout") {
      handleLogout();
    }
  };


  const handleMobileClick = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/logout' , { withCredentials: true });
      if(response){
          navigate('/login')
      }
    } catch (error) {
      console.log(error);
      
    }
  }

  return (
    <div>
      <div className="flex">

        <div style={{ width: isOpen ? "210px" : "120px" , transition: "width 0.3s ease-in-out" }} className="border-r flex flex-col gap-12 items-center shadow-lg border-gray-200 text-white p-4">
          <div style={{ width: "100px"}}>
            <img src={logo} alt="" />
          </div>
          <div className="p-4 text-black ">
            <ul className="space-y-2 flex flex-col gap-8">
              {navItems.map((item, index) => (
                <Link
                  to={item.path}
                  key={index}
                  style={{ color: activeIndex === index ? '#1E40AF' : '' }}
                  onClick={() => handleItemClick(index)}
                  className="hover:text-[#1E40AF] flex items-center gap-2"

                >
                  {item.icon}
                  {
                    isOpen && (
                      <span >{item.name}</span>
                    )
                  }
                </Link>
              ))}
            </ul>
          </div>
          <button onClick={handleMobileClick} className="p-1 mt-auto text-black w-full bg-[#EFF6FF] rounded-xl cursor-pointer hover:text-[#1E40AF] flex items-center justify-center gap-2">
            {isOpen ? <ChevronsLeft /> : <ChevronsRight />} 
          </button>
        </div>
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
