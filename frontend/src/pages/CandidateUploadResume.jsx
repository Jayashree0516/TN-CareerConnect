
import { useState } from "react";

function CandidateUploadResume({ onBack }) {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const uploadResume = async () => {
    if (!resume) {
      showMessage("Please select a PDF resume first.", "error");
      return;
    }

    if (resume.type !== "application/pdf") {
      showMessage("Only PDF files are allowed.", "error");
      return;
    }

    if (resume.size > 5 * 1024 * 1024) {
      showMessage("File size must be less than 5 MB.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("candidate_token");
      const formData = new FormData();

      formData.append("resume", resume);

      const response = await fetch(
        "http://127.0.0.1:5000/api/candidate/resume",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        showMessage(
          data.message || "Resume uploaded successfully!"
        );
      } else {
        showMessage(
          data.message || "Unable to upload resume.",
          "error"
        );
      }
    } catch (error) {
      console.error("Resume Upload Error:", error);
      showMessage("Unable to connect to the server.", "error");
    }
  };

  const downloadResume = async () => {
    try {
      const token = localStorage.getItem("candidate_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/candidate/resume/download",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        showMessage(
          data.message || "Unable to download resume.",
          "error"
        );
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "My_Resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      showMessage("Resume downloaded successfully!");
    } catch (error) {
      console.error("Resume Download Error:", error);
      showMessage("Unable to download resume.", "error");
    }
  };

  const primaryButton = {
    backgroundColor: "#123b65",
    color: "#ffffff",
    padding: "12px 22px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600"
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "35px 20px",
      backgroundColor: "#f1f5f9",
      color: "#263746",
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
        maxWidth: "750px",
        margin: "auto"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "30px",
          textAlign: "center",
          marginBottom: "25px"
        }}>
          Upload Resume
        </h2>

        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #dce3ec",
          borderRadius: "12px",
          padding: "35px 25px",
          textAlign: "center",
          boxShadow: "0 3px 12px rgba(0,0,0,0.07)"
        }}>

          <div style={{
            fontSize: "48px",
            marginBottom: "15px"
          }}>
            📄
          </div>

          <h3 style={{
            color: "#123b65",
            fontSize: "21px",
            marginBottom: "12px"
          }}>
            Upload Your Resume
          </h3>

          <p style={{
            color: "#64748b",
            fontSize: "15px",
            lineHeight: "1.6",
            marginBottom: "22px"
          }}>
            Select your latest resume in PDF format.
            <br />
            Maximum file size: 5 MB.
          </p>

          <div style={{
            backgroundColor: "#f1f5f9",
            border: "1px dashed #94a3b8",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "22px"
          }}>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => {
                setResume(e.target.files[0] || null);
                setMessage("");
                setMessageType("");
              }}
              style={{
                maxWidth: "100%",
                color: "#334155"
              }}
            />

            {resume && (
              <p style={{
                color: "#123b65",
                fontWeight: "600",
                marginTop: "15px",
                overflowWrap: "anywhere"
              }}>
                Selected: {resume.name}
              </p>
            )}
          </div>

          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}>
            <button
              onClick={uploadResume}
              style={primaryButton}
            >
              Upload Resume
            </button>

            <button
              onClick={downloadResume}
              style={{
                ...primaryButton,
                backgroundColor: "#ffffff",
                color: "#123b65",
                border: "1px solid #123b65"
              }}
            >
              Download Resume
            </button>
          </div>

          {message && (
            <p style={{
              marginTop: "22px",
              padding: "12px",
              borderRadius: "6px",
              backgroundColor:
                messageType === "error" ? "#fee2e2" : "#dcfce7",
              color:
                messageType === "error" ? "#b91c1c" : "#166534",
              fontWeight: "600"
            }}>
              {message}
            </p>
          )}
        </div>

      </div>
    </div>
  );
}

export default CandidateUploadResume;
