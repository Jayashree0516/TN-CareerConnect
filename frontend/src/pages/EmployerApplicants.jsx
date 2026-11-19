
import { useEffect, useState } from "react";

function EmployerApplicants({ onBack }) {
  const [applicants, setApplicants] = useState([]);
  const [message, setMessage] = useState("Loading applicants...");
  const [messageType, setMessageType] = useState("");

  const downloadResume = async (applicationId, candidateName) => {
    try {
      const token = localStorage.getItem("employer_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/employer/applications/${applicationId}/resume`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setMessage(data.message || "Unable to download resume.");
        setMessageType("error");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${candidateName}_Resume.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Resume Download Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("employer_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/employer/applications/${applicationId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            application_status: newStatus
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setApplicants((previousApplicants) =>
          previousApplicants.map((applicant) =>
            applicant.application_id === applicationId
              ? {
                  ...applicant,
                  application_status: newStatus
                }
              : applicant
          )
        );

        setMessage("Application status updated successfully.");
        setMessageType("success");
      } else {
        setMessage(
          data.message || "Unable to update application status."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      setMessage("Unable to connect to the server.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadApplicants = async () => {
      try {
        const token = localStorage.getItem("employer_token");

        const response = await fetch(
          "http://127.0.0.1:5000/api/employer/applicants",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (ignore) return;

        if (response.ok) {
          const applicantList = data.applicants || [];

          setApplicants(applicantList);
          setMessage(
            applicantList.length === 0
              ? "No applicants found yet."
              : ""
          );
        } else {
          setMessage(data.message || "Unable to fetch applicants.");
          setMessageType("error");
        }
      } catch (error) {
        if (!ignore) {
          console.error("Applicants Error:", error);
          setMessage("Unable to connect to the server.");
          setMessageType("error");
        }
      }
    };

    loadApplicants();

    return () => {
      ignore = true;
    };
  }, []);

  const getStatusStyle = (status) => {
    const normalizedStatus = status?.toLowerCase();

    if (
      normalizedStatus === "selected" ||
      normalizedStatus === "shortlisted"
    ) {
      return {
        background: "#dcfce7",
        color: "#166534"
      };
    }

    if (normalizedStatus === "rejected") {
      return {
        background: "#fee2e2",
        color: "#b91c1c"
      };
    }

    if (normalizedStatus === "under review") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8"
      };
    }

    return {
      background: "#fef3c7",
      color: "#92400e"
    };
  };

  const detailStyle = {
    color: "#475569",
    fontSize: "14px",
    lineHeight: "1.7",
    margin: "5px 0"
  };

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
        maxWidth: "1050px",
        margin: "auto"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "28px",
          marginBottom: "8px"
        }}>
          View Applicants
        </h2>

        <p style={{
          color: "#64748b",
          marginBottom: "25px",
          fontSize: "14px"
        }}>
          Review candidate profiles and manage their applications.
        </p>

        {message && (
          <div style={{
            padding: "13px 16px",
            marginBottom: "20px",
            borderRadius: "7px",
            backgroundColor:
              messageType === "error"
                ? "#fee2e2"
                : messageType === "success"
                  ? "#dcfce7"
                  : "#e2e8f0",
            color:
              messageType === "error"
                ? "#b91c1c"
                : messageType === "success"
                  ? "#166534"
                  : "#475569",
            fontWeight: "500"
          }}>
            {message}
          </div>
        )}

        {applicants.map((applicant) => (
          <div
            key={applicant.application_id}
            style={{
              backgroundColor: "#ffffff",
              padding: "25px",
              marginBottom: "20px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 3px 10px rgba(0,0,0,0.05)"
            }}
          >

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "18px"
            }}>

              <h3 style={{
                color: "#123b65",
                fontSize: "21px",
                margin: 0
              }}>
                {applicant.full_name}
              </h3>

              <span style={{
                ...getStatusStyle(applicant.application_status),
                padding: "6px 13px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "700"
              }}>
                {applicant.application_status}
              </span>

            </div>

            <div style={{
              backgroundColor: "#f8fafc",
              padding: "15px",
              borderRadius: "7px",
              marginBottom: "18px"
            }}>
              <p style={detailStyle}>
                <strong>Applied Job:</strong> {applicant.job_title}
              </p>
              <p style={detailStyle}>
                <strong>Email:</strong> {applicant.email}
              </p>
              <p style={detailStyle}>
                <strong>Phone:</strong> {applicant.phone}
              </p>
              <p style={detailStyle}>
                <strong>Qualification:</strong> {applicant.qualification}
              </p>
              <p style={detailStyle}>
                <strong>Skills:</strong> {applicant.skills}
              </p>
              <p style={detailStyle}>
                <strong>Experience:</strong> {applicant.experience_years} years
              </p>
            </div>

            <h4 style={{
              color: "#123b65",
              marginBottom: "10px",
              fontSize: "15px"
            }}>
              Application Status
            </h4>

            <select
              value={applicant.application_status}
              onChange={(e) =>
                updateApplicationStatus(
                  applicant.application_id,
                  e.target.value
                )
              }
              style={{
                width: "100%",
                maxWidth: "300px",
                padding: "11px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                marginBottom: "20px",
                color: "#334155",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
              <option value="Selected">Selected</option>
            </select>

            <h4 style={{
              color: "#123b65",
              marginBottom: "8px",
              fontSize: "15px"
            }}>
              Cover Letter
            </h4>

            <p style={{
              color: "#475569",
              fontSize: "14px",
              lineHeight: "1.7",
              whiteSpace: "pre-wrap",
              marginBottom: "18px"
            }}>
              {applicant.cover_letter || "No cover letter provided."}
            </p>

            {applicant.resume_path ? (
              <button
                onClick={() =>
                  downloadResume(
                    applicant.application_id,
                    applicant.full_name
                  )
                }
                style={{
                  backgroundColor: "#123b65",
                  color: "#ffffff",
                  padding: "11px 18px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "13px"
                }}
              >
                Download Resume
              </button>
            ) : (
              <p style={{
                color: "#94a3b8",
                fontSize: "13px",
                fontWeight: "500"
              }}>
                Resume not uploaded
              </p>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default EmployerApplicants;
