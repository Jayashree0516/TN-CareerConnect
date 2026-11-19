
import { useState } from "react";

function AdminLogin({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (response.ok && data.access_token) {
        localStorage.setItem("admin_token", data.access_token);
        localStorage.setItem(
          "admin_data",
          JSON.stringify(data.admin)
        );

        setMessage("Admin login successful!");

        onLoginSuccess();
      } else {
        setMessage(data.message || "Invalid login credentials.");
      }
    } catch (error) {
      console.error("Admin Login Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <button
          type="button"
          onClick={onBack}
          style={backButtonStyle}
          title="Back to Home"
          aria-label="Back to Home"
        >
          ←
        </button>

        <h2 style={{
          color: "#12345a",
          textAlign: "center"
        }}>
          Admin Login
        </h2>

        <label>Email Address</label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter admin email"
          required
          style={inputStyle}
        />

        <label>Password</label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={loginButtonStyle}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={{
          textAlign: "center",
          marginTop: "15px"
        }}>
          {message}
        </p>
      </form>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px"
};

const formStyle = {
  position: "relative",
  background: "white",
  padding: "55px 35px 35px",
  width: "100%",
  maxWidth: "400px",
  borderRadius: "12px",
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)"
};

const backButtonStyle = {
  position: "absolute",
  top: "15px",
  left: "18px",
  width: "35px",
  height: "35px",
  background: "transparent",
  border: "none",
  color: "#12345a",
  fontSize: "30px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "18px",
  boxSizing: "border-box"
};

const loginButtonStyle = {
  width: "100%",
  padding: "12px",
  background: "#12345a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default AdminLogin;
