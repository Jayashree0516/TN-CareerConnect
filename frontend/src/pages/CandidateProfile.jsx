
import { useEffect, useState } from "react";

function CandidateProfile({ onBack }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("Loading profile...");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("candidate_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/candidate/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile || data.candidate || data);
        setMessage("");
      } else {
        setMessage(data.message || "Unable to load profile.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      await fetchProfile();
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("candidate_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/candidate/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phone: profile.phone,
            qualification: profile.qualification,
            skills: profile.skills,
            experience_years: Number(profile.experience_years),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Profile updated successfully!");
        setEditing(false);
        await fetchProfile();
      } else {
        setMessage(data.message || "Profile update failed.");
      }
    } catch {
      setMessage("Unable to connect to the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "650px",
        margin: "40px auto",
        padding: "30px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <button
        type="button"
        onClick={onBack}
        title="Back to Dashboard"
        aria-label="Back to Dashboard"
        style={arrowButtonStyle}
      >
        ←
      </button>

      <h2 style={{ color: "#12345a", textAlign: "center" }}>
        My Profile
      </h2>

      {message && <p>{message}</p>}

      {profile && (
        <form onSubmit={handleSave}>
          <p><strong>Name:</strong> {profile.full_name}</p>
          <p><strong>Email:</strong> {profile.email}</p>

          <label>Phone:</label>
          <input
            name="phone"
            value={profile.phone || ""}
            onChange={handleChange}
            disabled={!editing}
            style={inputStyle}
          />

          <label>Qualification:</label>
          <input
            name="qualification"
            value={profile.qualification || ""}
            onChange={handleChange}
            disabled={!editing}
            style={inputStyle}
          />

          <label>Skills:</label>
          <input
            name="skills"
            value={profile.skills || ""}
            onChange={handleChange}
            disabled={!editing}
            style={inputStyle}
          />

          <label>Experience (years):</label>
          <input
            type="number"
            name="experience_years"
            min="0"
            step="0.5"
            value={profile.experience_years ?? 0}
            onChange={handleChange}
            disabled={!editing}
            style={inputStyle}
          />

          {editing ? (
            <>
              <button type="submit" disabled={saving} style={buttonStyle}>
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                style={backButtonStyle}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              style={buttonStyle}
            >
              Edit Profile
            </button>
          )}
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "8px 0 18px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  boxSizing: "border-box",
};

const buttonStyle = {
  padding: "12px 20px",
  background: "#12345a",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
};

const backButtonStyle = {
  padding: "10px 20px",
  marginTop: "15px",
  cursor: "pointer",
};

const arrowButtonStyle = {
  position: "absolute",
  top: "12px",
  left: "15px",
  width: "38px",
  height: "38px",
  border: "none",
  background: "transparent",
  color: "#12345a",
  fontSize: "32px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export default CandidateProfile;
