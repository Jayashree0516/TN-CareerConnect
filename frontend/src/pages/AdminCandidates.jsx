
import { useEffect, useState } from "react";

function AdminCandidates({ onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [message, setMessage] = useState("Loading candidates...");

  const fetchCandidates = async () => {
    try {
      const token = localStorage.getItem("admin_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/admin/candidates",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        const candidateList = data.candidates || [];
        setCandidates(candidateList);

        setMessage(
          candidateList.length === 0
            ? "No candidates found."
            : ""
        );
      } else {
        setMessage(data.message || "Unable to fetch candidates.");
      }
    } catch (error) {
      console.error("Candidates Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  useEffect(() => {
    const loadCandidates = async () => {
      await fetchCandidates();
    };

    loadCandidates();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      padding: "35px 20px",
      boxSizing: "border-box",
      position: "relative"
    }}>

      <button
        type="button"
        onClick={onBack}
        title="Back to Dashboard"
        aria-label="Back to Dashboard"
        style={{
          position: "absolute",
          top: "15px",
          left: "20px",
          width: "38px",
          height: "38px",
          border: "none",
          background: "transparent",
          color: "#123b65",
          fontSize: "32px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        ←
      </button>

      <div style={{
        maxWidth: "1100px",
        margin: "auto"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "27px",
          marginBottom: "8px"
        }}>
          View Candidates
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: "14px",
          marginBottom: "25px"
        }}>
          View registered candidate details and their qualifications.
        </p>

        {message && (
          <div style={{
            backgroundColor: message.includes("Unable")
              ? "#fee2e2"
              : "#e2e8f0",
            color: message.includes("Unable")
              ? "#b91c1c"
              : "#475569",
            padding: "14px 16px",
            borderRadius: "7px",
            marginBottom: "20px",
            fontSize: "14px"
          }}>
            {message}
          </div>
        )}

        {candidates.map((candidate) => (
          <div
            key={candidate.candidate_id}
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              marginBottom: "18px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)"
            }}
          >

            <h3 style={{
              color: "#123b65",
              fontSize: "20px",
              marginTop: 0,
              marginBottom: "18px"
            }}>
              {candidate.full_name}
            </h3>

            <div style={{
              backgroundColor: "#f8fafc",
              padding: "15px",
              borderRadius: "7px"
            }}>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Email:</strong> {candidate.email}
              </p>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Phone:</strong> {candidate.phone}
              </p>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Qualification:</strong> {candidate.qualification}
              </p>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Skills:</strong> {candidate.skills}
              </p>

              <p style={{
                color: "#475569",
                fontSize: "14px",
                margin: "7px 0"
              }}>
                <strong>Experience:</strong> {candidate.experience_years} years
              </p>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default AdminCandidates;
