
import { useEffect, useState } from "react";

function CandidateFindJobs({ onBack }) {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("Loading jobs...");
  const [applyMessage, setApplyMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/jobs");
        const data = await response.json();

        if (response.ok) {
          setJobs(data.jobs || []);
          setMessage(
            data.jobs?.length ? "" : "No jobs are currently available."
          );
        } else {
          setMessage(data.message || "Unable to load jobs.");
        }
      } catch (error) {
        console.error("Find Jobs Error:", error);
        setMessage("Unable to connect to the server.");
      }
    };

    fetchJobs();
  }, []);

  const applyForJob = async (jobId) => {
    try {
      const token = localStorage.getItem("candidate_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/jobs/${jobId}/apply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      setApplyMessage(
        data.message ||
        (response.ok
          ? "Application submitted successfully!"
          : "Unable to apply for this job.")
      );
    } catch (error) {
      console.error("Apply Job Error:", error);
      setApplyMessage("Unable to connect to the server.");
    }
  };

  const saveJob = async (jobId) => {
    try {
      const token = localStorage.getItem("candidate_token");

      const response = await fetch(
        "http://127.0.0.1:5000/api/candidate/saved-jobs",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ job_id: jobId })
        }
      );

      const data = await response.json();

      setApplyMessage(
        data.message ||
        (response.ok
          ? "Job saved successfully!"
          : "Unable to save job.")
      );
    } catch (error) {
      console.error("Save Job Error:", error);
      setApplyMessage("Unable to connect to the server.");
    }
  };

  const buttonStyle = {
    padding: "11px 20px",
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

      <div style={{ maxWidth: "1100px", margin: "auto" }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "30px",
          textAlign: "center",
          marginBottom: "25px"
        }}>
          Find Jobs
        </h2>

        {message && (
          <p style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "17px"
          }}>
            {message}
          </p>
        )}

        {applyMessage && (
          <p style={{
            textAlign: "center",
            color: "#087443",
            backgroundColor: "#e1f5e9",
            padding: "12px",
            borderRadius: "6px",
            fontWeight: "600"
          }}>
            {applyMessage}
          </p>
        )}

        {jobs.map((job) => (
          <div
            key={job.job_id}
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #dce3ec",
              padding: "25px",
              margin: "18px auto",
              borderRadius: "12px",
              maxWidth: "950px",
              boxShadow: "0 3px 12px rgba(0,0,0,0.07)"
            }}
          >
            <h3 style={{
              color: "#123b65",
              fontSize: "22px",
              marginBottom: "14px"
            }}>
              {job.job_title}
            </h3>

            <p style={{ margin: "9px 0" }}>
              <strong>Category:</strong> {job.job_category}
            </p>
            <p style={{ margin: "9px 0" }}>
              <strong>Location:</strong> {job.location}
            </p>
            <p style={{ margin: "9px 0" }}>
              <strong>Job Type:</strong> {job.job_type}
            </p>

            <div style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "20px"
            }}>
              <button
                onClick={() => applyForJob(job.job_id)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#123b65",
                  color: "#ffffff"
                }}
              >
                Apply Now
              </button>

              <button
                onClick={() => saveJob(job.job_id)}
                style={{
                  ...buttonStyle,
                  backgroundColor: "#ffffff",
                  color: "#123b65",
                  border: "1px solid #123b65"
                }}
              >
                Save Job
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default CandidateFindJobs;
