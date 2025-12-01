import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { registerTelemarketer } from "../../redux/feature/telemarketer/telemarketerthunx";

export default function Registertelemarketer() {
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.telemarketer);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobileno: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerTelemarketer(formData));
  };

  // ✅ Show toast messages
  useEffect(() => {
    if (success) {
      toast.success("Telemarketer registered successfully! 🎉");
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  return (
    <div className="container">
      <form className="card" onSubmit={handleSubmit}>
        <h2>Telemarketer Register</h2>

        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="mobileno"
          placeholder="Enter Mobile Number"
          value={formData.mobileno}
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

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <style jsx>{`
        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f3f4f6;
        }
        .card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
          width: 350px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        h2 {
          text-align: center;
          color: #333;
        }
        input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #2563eb;
        }
        button {
          background: #2563eb;
          color: white;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover {
          background: #1e40af;
        }
      `}</style>
    </div>
  );
}