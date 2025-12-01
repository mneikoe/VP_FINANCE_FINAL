import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "../../redux/feature/auth/authThunx";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    loginId: "", // Can be email or employee code
    password: "",
  });

  const [loginType, setLoginType] = useState("email"); // "email" or "employeeCode"

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = (e) => {
  e.preventDefault();
  
  // ✅ IMPROVED: Prepare login data properly
  let loginData = {};
  
  if (loginType === "email") {
    loginData = {
      email: formData.loginId,
      password: formData.password
    };
  } else {
    loginData = {
      employeeCode: formData.loginId,
      password: formData.password
    };
  }
  
  console.log("📤 Login data:", loginData);
  dispatch(loginUser(loginData));
};

  // Switch between email and employee code login
  const toggleLoginType = () => {
    setLoginType(loginType === "email" ? "employeeCode" : "email");
    setFormData({ ...formData, loginId: "" }); // Clear input when switching
  };

  useEffect(() => {
    if (user) {
      toast.success(`Welcome ${user.username} (${user.role}) 🎉`);

      // Redirect based on role
      if (user.role === "Telecaller") {
        navigate("/telecaller/dashboard");
      } else if (user.role === "Telemarketer") {
        navigate("/telemarketer/dashboard");
      } else if (user.role === "OA") {
        navigate("/");
      } else if (user.role === "OE") {
        navigate("/oe/dashboard");
      } else if (user.role === "HR") {
        navigate("/dashboard");
      } else if (user.role === "RM") {
        navigate("/rm/dashboard");
      } else {
        // For new employees added through system
        navigate("/dashboard");
      }
    }
    if (error) {
      toast.error(error);
    }
  }, [user, error, navigate]);

  // Handle test login for HR specifically
  const handleHRTestLogin = () => {
    // Create a test HR user object
    const testUser = {
      username: "HR Manager",
      email: "hr@test.com",
      role: "HR",
      token: "test-token-hr"
    };
    
    // Save to localStorage
    localStorage.setItem("token", testUser.token);
    localStorage.setItem("user", JSON.stringify(testUser));
    
    // Dispatch success and navigate
    toast.success("Logged in as HR Manager");
    navigate("/dashboard");
  };

  return (
    <div className="container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        
        {/* Login Type Toggle */}
        <div className="login-type-toggle">
          <button 
            type="button"
            className={`toggle-btn ${loginType === "email" ? "active" : ""}`}
            onClick={() => setLoginType("email")}
          >
            📧 Email Login
          </button>
          <button 
            type="button"
            className={`toggle-btn ${loginType === "employeeCode" ? "active" : ""}`}
            onClick={() => setLoginType("employeeCode")}
          >
            🆔 Employee Code
          </button>
        </div>

        {/* Dynamic Input based on login type */}
        <input
          type="text"
          name="loginId"
          placeholder={
            loginType === "email" 
              ? "Enter Email Address" 
              : "Enter Employee Code (e.g., TC1234)"
          }
          value={formData.loginId}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Help Text */}
        <div className="help-text">
          {loginType === "employeeCode" ? (
            <small>
              <strong>Employee Code Examples:</strong><br />
              • TC1234 (Telecaller)<br />
              • TM5678 (Telemarketer)<br />
              • OE9012 (OE)<br />
              • HR3456 (HR)<br />
              • RM7890 (RM)
            </small>
          ) : (
            <small>
              <strong>Default Password:</strong> 123456 for new employees
            </small>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "🔄 Logging in..." : "🚀 Login"}
        </button>
        
        {/* Quick Login Buttons */}
        <div className="quick-login-section">
          <p style={{ textAlign: "center", margin: "10px 0", color: "#666" }}>
            OR
          </p>
          
          <button 
            type="button" 
            onClick={handleHRTestLogin}
            className="quick-login-btn hr-btn"
          >
            👥 Login as HR Manager
          </button>

          <button 
            type="button" 
            onClick={toggleLoginType}
            className="quick-login-btn switch-btn"
          >
            {loginType === "email" ? "🆔 Switch to Employee Code" : "📧 Switch to Email Login"}
          </button>
        </div>

        {/* Register Links */}
        <div className="register-section">
          <p>Don't have an account? Contact Administrator</p>
          <div className="register-links">
            <Link to="/forgot-password" className="register-link">
              🔑 Forgot Password?
            </Link>
          </div>
        </div>
      </form>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: "Segoe UI", sans-serif;
        }

        .card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 420px;
        }

        h2 {
          text-align: center;
          margin-bottom: 20px;
          color: #333;
          font-size: 24px;
        }

        /* Login Type Toggle */
        .login-type-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .toggle-btn {
          flex: 1;
          padding: 10px;
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .toggle-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .toggle-btn:hover {
          border-color: #667eea;
        }

        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }

        .help-text {
          background: #f8f9ff;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 4px solid #667eea;
        }

        .help-text small {
          color: #666;
          font-size: 12px;
          line-height: 1.4;
        }

        button[type="submit"] {
          width: 100%;
          padding: 12px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }

        button[type="submit"]:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }

        button[type="submit"]:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        /* Quick Login Section */
        .quick-login-section {
          margin: 20px 0;
        }

        .quick-login-btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: all 0.3s ease;
        }

        .hr-btn {
          background: #4f46e5;
          color: white;
        }

        .hr-btn:hover {
          background: #4338ca;
          transform: translateY(-1px);
        }

        .switch-btn {
          background: transparent;
          color: #667eea;
          border: 1px solid #667eea;
        }

        .switch-btn:hover {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }

        /* Register Section */
        .register-section {
          text-align: center;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }

        .register-section p {
          margin-bottom: 15px;
          color: #666;
          font-size: 14px;
        }

        .register-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .register-link {
          display: block;
          padding: 8px 12px;
          background: #f8f9ff;
          color: #667eea;
          text-decoration: none;
          border-radius: 6px;
          font-size: 13px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }

        .register-link:hover {
          background: #667eea;
          color: white;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .card {
            margin: 20px;
            padding: 20px;
          }
          
          .login-type-toggle {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}