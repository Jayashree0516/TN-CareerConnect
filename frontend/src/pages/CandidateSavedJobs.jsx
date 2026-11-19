
import { useEffect, useState } from "react";

function CandidateSavedJobs({ onBack }) {
  const [savedJobs, setSavedJobs] = useState([]);
  const [message, setMessage] = useState("Loading saved jobs...");

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const token = localStorage.getItem("candidate_token");

        const response = await fetch(
          "http://127.0.0.1:5000/api/candidate/saved-jobs",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setSavedJobs(data.saved_jobs || []);
          setMessage(
            data.saved_jobs?.length
              ? ""
              : "You haven't saved any jobs yet."
          );
        } else {
          setMessage(data.message || "Unable to load saved jobs.");
        }
      } catch (error) {
        console.error("Saved Jobs Error:", error);
        setMessage("Unable to connect to the server.");
      }
    };

    fetchSavedJobs();
  }, []);

  const removeSavedJob = async (jobId) => {
    try {
      const token = localStorage.getItem("candidate_token");

      const response = await fetch(
        `http://127.0.0.1:5000/api/candidate/saved-jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        const updatedJobs = savedJobs.filter(
          (job) => job.job_id !== jobId
        );

        setSavedJobs(updatedJobs);
        setMessage(
          updatedJobs.length
            ? data.message || "Job removed successfully!"
            : "You haven't saved any jobs yet."
        );
      } else {
        setMessage(data.message || "Unable to remove saved job.");
      }
    } catch (error) {
      console.error("Remove Saved Job Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  const buttonStyle = {
    padding: "11px 22px",
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
          My Saved Jobs
        </h2>

        {message && (
          <p style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "17px",
            margin: "20px 0"
          }}>
            {message}
          </p>
        )}

        {savedJobs.map((job) => (
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
              <strong>Company:</strong> {job.company_name}
            </p>
            <p style={{ margin: "9px 0" }}>
              <strong>Category:</strong> {job.job_category}
            </p>
            <p style={{ margin: "9px 0" }}>
              <strong>Location:</strong> {job.location}
            </p>
            <p style={{ margin: "9px 0" }}>
              <strong>Job Type:</strong> {job.job_type}
            </p>

            <button
              onClick={() => removeSavedJob(job.job_id)}
              style={{
                ...buttonStyle,
                backgroundColor: "#dc3545",
                color: "#ffffff",
                marginTop: "15px"
              }}
            >
              Remove
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}

export default CandidateSavedJobs;
