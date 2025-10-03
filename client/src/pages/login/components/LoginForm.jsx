import axios from "axios";
import { useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const LoginForm = () => {

  const navigate = useNavigate()

  const { login } = useAuth()
  const [user , setUser] = useState({
    email : '',
    password : ''
  })

  const [error , setError] = useState('')
  const [isLoading , setIsLoading] = useState(false)

  const handleInputChange = (event) => {
    setUser({
      ...user,
      [event.target.name] : event.target.value
    })
  }


  const isValidForm = () => {
    return user.email.length > 0 && user.password.length > 0
  }

  const isValidEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(user.email)
  }

  const isValidPassword = () => {
    return user.password.length >= 6
  }

  const handleLogin = async (event) => {
  event.preventDefault();
  setError("");
  setIsLoading(true);

  if (!isValidForm() || !isValidEmail() || !isValidPassword()) {
    setError("Invalid email or password format");
    setIsLoading(false);
    return;
  }

  try {
    const response = await axios.post(
      "https://admin.oriventa-pro-service.com/api/auth/login",
      user,
      { withCredentials: true }
    );
    setIsLoading(false);
    toast.success("Signed in successfully");
    login(response.data)
    navigate("/");
  } catch (error) {
    setIsLoading(false);
    if (error.response) {
      setError(error.response.data.message);
    } else {
      setError("An error occurred while logging in");
    }
  }
};

    


  return (
    <div className="w-full max-w-md mx-auto">
      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          {/* Error messages */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
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
            onChange={handleInputChange}
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
            onChange={handleInputChange}
            className="w-full rounded border border-gray-200 focus:border-gray-400 outline-0 p-2 "
          />
        </div>
        <div className="flex item-center">
          <button
            type="submit"
            className="mt-8 w-full p-2 rounded cursor-pointer bg-[#1D4ED8] text-amber-50"
            disabled={isLoading}

          >
            {isLoading ? "Signing In..." :  "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
