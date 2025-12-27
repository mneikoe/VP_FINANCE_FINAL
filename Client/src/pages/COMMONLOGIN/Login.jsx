import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "../../redux/feature/auth/authThunx";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaBuilding,
} from "react-icons/fa";
import "./Login.css";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // -----------------------------------------
  // INPUT HANDLER
  // -----------------------------------------
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // -----------------------------------------
  // LOGIN HANDLER
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email: formData.email.trim(),
      password: formData.password,
    };

    try {
      await dispatch(loginUser(loginData)).unwrap();
    } catch (_) {}
  };

  // -----------------------------------------
  // REDIRECT AFTER SUCCESS LOGIN
  // -----------------------------------------
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    switch (role) {
      case "HR":
        navigate("/dashboard");
        break;
      case "Telecaller":
        navigate("/telecaller/dashboard");
        break;
      case "Telemarketer":
        navigate("/telemarketer/dashboard");
        break;
      case "OA":
        navigate("/");
        break;
      case "OE":
        navigate("/oe/dashboard");
        break;
      case "RM":
        navigate("/rm/dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Login Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-brand">
              <div className="brand-icon">
                <FaBuilding className="company-icon" />
              </div>
              <div className="brand-text">
                <h1>VP Financial Portal</h1>
                <p className="brand-subtitle">Secure Employee Login</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="input-group">
              <div className="input-icon">
                <FaUser className="text-muted" />
              </div>
              <input
                type="email"
                name="email"
                className="login-input"
                placeholder="Enter your company email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="input-icon">
                <FaLock className="text-muted" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="login-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="login-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
            >
              <FaSignInAlt className="btn-icon" />
              {loading ? "Accessing Portal..." : "Login to Portal"}
            </button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p className="footer-note">
              © {new Date().getFullYear()} VP Financial Services. All rights
              reserved.
              <br />
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Company Info Panel */}
        {/* <div className="company-sidebar">
          <div className="company-header">
            <div className="company-logo">
              <FaBuilding className="logo-icon" />
              <h2>VP Financial</h2>
            </div>
            <p className="company-tagline">Excellence in Financial Services</p>
          </div>

          <div className="company-features">
            <h3>Portal Features</h3>
            <div className="feature-list">
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">
                  <h4>HR Management</h4>
                  <p>Complete employee lifecycle management</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">
                  <h4>Recruitment</h4>
                  <p>End-to-end hiring process tracking</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">
                  <h4>Analytics</h4>
                  <p>Real-time business insights & reports</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✓</div>
                <div className="feature-text">
                  <h4>Secure Access</h4>
                  <p>Enterprise-grade security protocols</p>
                </div>
              </div>
            </div>
          </div>

          <div className="company-departments">
            <h3>Department Access</h3>
            <div className="department-tags">
              <span className="department-tag">HR</span>
              <span className="department-tag">Telecaller</span>
              <span className="department-tag">Telemarketer</span>
              <span className="department-tag">Operations</span>
              <span className="department-tag">Relationship Manager</span>
              <span className="department-tag">Executive</span>
            </div>
          </div>

          <div className="company-footer">
            <p className="support-hours">Mon-Fri: 9AM-6PM | Sat: 10AM-2PM</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
