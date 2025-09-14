import LoginForm from "./components/LoginForm"
import LoginHeader from "./components/LoginHeader"

const Login = () => {






  return (
      <div className="min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <LoginHeader />
          <div className=" rounded-2xl shadow-xl p-8">
            <LoginForm />
          </div>
          
          {/* Footer */}
          <div className="text-center mt-8">
            <p className=" text-sm">
              © {new Date().getFullYear()} Oriventa Pro Services. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <a href="#" className=" text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className=" text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className=" text-sm transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Login