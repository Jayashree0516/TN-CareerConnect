function CandidateDashboard({
  onLogout,
  onProfileClick,
  onFindJobsClick,
  onApplicationsClick,
  onSavedJobsClick,
  onUploadResumeClick,

})
{

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f7fb",
      padding: "30px"
    }}>
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#12345a",
        color: "white",
        padding: "20px",
        borderRadius: "10px"
      }}>
        <h2>TN CareerConnect</h2>

        <button onClick={onLogout} style={{
          padding: "10px 20px",
          cursor: "pointer"
        }}>
          Logout
        </button>
      </header>

      <h2 style={{ color: "#12345a", marginTop: "35px" }}>
        Welcome, Candidate!
      </h2>

      <p>Manage your job search from your dashboard.</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginTop: "30px"
      }}>
        {["My Profile", "Find Jobs", "My Applications", "Saved Jobs", "Upload Resume"].map((item) => (
          <div
  key={item}
  onClick={
  item === "My Profile"
    ? onProfileClick
    : item === "Find Jobs"
    ? onFindJobsClick
    : item === "My Applications"
    ? onApplicationsClick
    : item === "Saved Jobs"
    ? onSavedJobsClick
    : item === "Upload Resume"
    ? onUploadResumeClick
    : undefined
}

  style={{
    background: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    cursor: ["My Profile", "Find Jobs", "My Applications", "Saved Jobs", "Upload Resume"].includes(item)
  ? "pointer"
  : "default"
  }}
>
            <h3 style={{ color: "#12345a" }}>{item}</h3>
            <p>Manage your {item.toLowerCase()} here.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CandidateDashboard;
