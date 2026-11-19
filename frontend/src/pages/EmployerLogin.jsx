
import { useState } from "react";

function EmployerLogin({ onBack, onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/api/employer/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("employer_token", data.access_token);
        localStorage.setItem("employer_data", JSON.stringify(data.employer));
        onLoginSuccess();
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      console.error("Employer Login Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <button
          type="button"
          onClick={onBack}
          style={backButtonStyle}
          title="Back to Home"
          aria-label="Back to Home"
        >
          ←
        </button>

        <h2 style={{ color: "#12345a", textAlign: "center" }}>
          Employer Login
        </h2>

        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <button type="submit" style={loginButtonStyle}>
            Login
          </button>
        </form>

        <p>{message}</p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "30px"
};

const containerStyle = {
  position: "relative",
  background: "white",
  padding: "55px 35px 35px",
  width: "100%",
  maxWidth: "400px",
  borderRadius: "10px"
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
  padding: "11px",
  margin: "8px 0 15px",
  boxSizing: "border-box"
};

const loginButtonStyle = {
  width: "100%",
  background: "#12345a",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default EmployerLogin;
