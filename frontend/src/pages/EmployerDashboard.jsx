
function EmployerDashboard({
  onLogout,
  onPostJobClick,
  onManageJobsClick,
  onViewApplicantsClick
}) {
  const employer = JSON.parse(
    localStorage.getItem("employer_data") || "{}"
  );

  const dashboardItems = [
    {
      title: "Post a Job",
      description: "Create and publish new job opportunities.",
      icon: "📢",
      action: onPostJobClick
    },
    {
      title: "Manage Jobs",
      description: "View, manage and update your job postings.",
      icon: "💼",
      action: onManageJobsClick
    },
    {
      title: "View Applicants",
      description: "Review candidate applications and update their status.",
      icon: "👥",
      action: onViewApplicantsClick
    }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f1f5f9",
      padding: "30px 20px",
      boxSizing: "border-box"
    }}>

      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "15px",
        backgroundColor: "#123b65",
        color: "#ffffff",
        padding: "22px 28px",
        borderRadius: "12px",
        maxWidth: "1200px",
        margin: "auto",
        boxShadow: "0 3px 12px rgba(0,0,0,0.12)"
      }}>
        <h2 style={{ margin: 0, fontSize: "24px" }}>
          Employer Dashboard
        </h2>

        <button
          onClick={onLogout}
          style={{
            backgroundColor: "#ffffff",
            color: "#123b65",
            border: "none",
            padding: "11px 22px",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </header>

      <main style={{
        maxWidth: "1200px",
        margin: "35px auto"
      }}>

        <h2 style={{
          color: "#123b65",
          fontSize: "28px",
          marginBottom: "8px"
        }}>
          Welcome, {employer.company_name || "Employer"}!
        </h2>

        <p style={{
          color: "#64748b",
          fontSize: "16px",
          marginBottom: "30px"
        }}>
          Manage your recruitment activities from your dashboard.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "22px"
        }}>
          {dashboardItems.map((item) => (
            <div
              key={item.title}
              onClick={item.action}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  item.action();
                }
              }}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: "#ffffff",
                padding: "32px 25px",
                borderRadius: "12px",
                textAlign: "center",
                boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
                border: "1px solid #dce3ec",
                cursor: "pointer",
                transition: "transform 0.2s ease"
              }}
            >
              <div style={{
                fontSize: "45px",
                marginBottom: "18px"
              }}>
                {item.icon}
              </div>

              <h3 style={{
                color: "#123b65",
                fontSize: "21px",
                marginBottom: "12px"
              }}>
                {item.title}
              </h3>

              <p style={{
                color: "#64748b",
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

export default EmployerDashboard;
