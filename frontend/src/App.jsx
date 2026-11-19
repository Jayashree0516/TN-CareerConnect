
import './App.css'
import { useState } from 'react'

import CandidateRegister from './pages/CandidateRegister'
import CandidateLogin from './pages/CandidateLogin'
import CandidateDashboard from './pages/CandidateDashboard'
import CandidateProfile from './pages/CandidateProfile'
import CandidateFindJobs from './pages/CandidateFindJobs'
import CandidateApplications from './pages/CandidateApplications'
import CandidateSavedJobs from './pages/CandidateSavedJobs'
import CandidateUploadResume from './pages/CandidateUploadResume'

import EmployerRegister from './pages/EmployerRegister'
import EmployerLogin from './pages/EmployerLogin'
import EmployerDashboard from './pages/EmployerDashboard'
import EmployerPostJob from './pages/EmployerPostJob'
import EmployerManageJobs from './pages/EmployerManageJobs'
import EmployerApplicants from './pages/EmployerApplicants'

import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import AdminCandidates from './pages/AdminCandidates'
import AdminEmployers from './pages/AdminEmployers'
import AdminJobs from './pages/AdminJobs'
import AdminApplications from './pages/AdminApplications'
import AdminJobFairs from './pages/AdminJobFairs'

function App() {
  const [currentPage, setCurrentPage] = useState("home")
  const [openMenu, setOpenMenu] = useState(null)

  // EMI Calculator
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(8)
  const [loanDuration, setLoanDuration] = useState(12)
  const [emi, setEmi] = useState(null)

  // Contact form
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const [contactMessage, setContactMessage] = useState("")

  const handleLogout = () => {
    localStorage.removeItem("candidate_token")
    setCurrentPage("home")
  }

  const calculateEMI = (e) => {
    e.preventDefault()

    const principal = Number(loanAmount)
    const monthlyRate = Number(interestRate) / 12 / 100
    const months = Number(loanDuration)

    if (
      !Number.isFinite(principal) ||
      !Number.isFinite(monthlyRate) ||
      !Number.isFinite(months) ||
      principal <= 0 ||
      months <= 0 ||
      Number(interestRate) < 0
    ) {
      alert("Please enter valid loan details.")
      return
    }

    let monthlyEMI

    if (monthlyRate === 0) {
      monthlyEMI = principal / months
    } else {
      const factor = Math.pow(1 + monthlyRate, months)
      monthlyEMI = principal * monthlyRate * factor / (factor - 1)
    }

    setEmi(monthlyEMI)
  }

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    })
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()

    setContactMessage(
      "Thank you! This is a demonstration form. Your message has not been sent to a real support team."
    )

    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: ""
    })
  }

  // Candidate pages
  if (currentPage === "dashboard") {
    return (
      <CandidateDashboard
        onLogout={handleLogout}
        onProfileClick={() => setCurrentPage("profile")}
        onFindJobsClick={() => setCurrentPage("findJobs")}
        onApplicationsClick={() => setCurrentPage("applications")}
        onSavedJobsClick={() => setCurrentPage("savedJobs")}
        onUploadResumeClick={() => setCurrentPage("uploadResume")}
      />
    )
  }

  if (currentPage === "profile") {
    return <CandidateProfile onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "findJobs") {
    return <CandidateFindJobs onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "applications") {
    return <CandidateApplications onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "savedJobs") {
    return <CandidateSavedJobs onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "uploadResume") {
    return <CandidateUploadResume onBack={() => setCurrentPage("dashboard")} />
  }

  if (currentPage === "register") {
    return (
      <div className="app">
        <CandidateRegister onBack={() => setCurrentPage("home")} />
      </div>
    )
  }

  if (currentPage === "login") {
    return (
      <div className="app">
        <CandidateLogin
          onBack={() => setCurrentPage("home")}
          onRegister={() => setCurrentPage("register")}
          onLoginSuccess={() => setCurrentPage("dashboard")}
        />
      </div>
    )
  }

  // Employer pages
  if (currentPage === "employerRegister") {
    return <EmployerRegister onBack={() => setCurrentPage("home")} />
  }

  if (currentPage === "employerLogin") {
    return (
      <EmployerLogin
        onBack={() => setCurrentPage("home")}
        onLoginSuccess={() => setCurrentPage("employerDashboard")}
      />
    )
  }

  if (currentPage === "employerDashboard") {
    return (
      <EmployerDashboard
        onLogout={() => {
          localStorage.removeItem("employer_token")
          localStorage.removeItem("employer_data")
          setCurrentPage("home")
        }}
        onPostJobClick={() => setCurrentPage("employerPostJob")}
        onManageJobsClick={() => setCurrentPage("employerManageJobs")}
        onViewApplicantsClick={() => setCurrentPage("employerApplicants")}
      />
    )
  }

  if (currentPage === "employerPostJob") {
    return <EmployerPostJob onBack={() => setCurrentPage("employerDashboard")} />
  }

  if (currentPage === "employerManageJobs") {
    return <EmployerManageJobs onBack={() => setCurrentPage("employerDashboard")} />
  }

  if (currentPage === "employerApplicants") {
    return <EmployerApplicants onBack={() => setCurrentPage("employerDashboard")} />
  }

  // Admin pages
  if (currentPage === "adminLogin") {
    return (
      <AdminLogin
        onLoginSuccess={() => setCurrentPage("adminDashboard")}
        onBack={() => setCurrentPage("home")}
      />
    )
  }

  if (currentPage === "adminDashboard") {
    return (
      <AdminDashboard
        onLogout={() => {
          localStorage.removeItem("admin_token")
          setCurrentPage("home")
        }}
        onCandidatesClick={() => setCurrentPage("adminCandidates")}
        onEmployersClick={() => setCurrentPage("adminEmployers")}
        onJobsClick={() => setCurrentPage("adminJobs")}
        onApplicationsClick={() => setCurrentPage("adminApplications")}
        onJobFairsClick={() => setCurrentPage("adminJobFairs")}
      />
    )
  }

  if (currentPage === "adminCandidates") {
    return <AdminCandidates onBack={() => setCurrentPage("adminDashboard")} />
  }

  if (currentPage === "adminEmployers") {
    return <AdminEmployers onBack={() => setCurrentPage("adminDashboard")} />
  }

  if (currentPage === "adminJobs") {
    return <AdminJobs onBack={() => setCurrentPage("adminDashboard")} />
  }

  if (currentPage === "adminApplications") {
    return <AdminApplications onBack={() => setCurrentPage("adminDashboard")} />
  }

  if (currentPage === "adminJobFairs") {
    return <AdminJobFairs onBack={() => setCurrentPage("adminDashboard")} />
  }

  // Homepage career information
  const careers = [
    { category: "CAREER OPTIONS", title: "AGRICULTURAL ENGINEER", icon: "🌾" },
    { category: "CAREER OPTIONS", title: "VOCATIONAL COUNSELLOR", icon: "🎓" },
    { category: "CAREER OPTIONS", title: "ETHICAL HACKER", icon: "🛡️" },
    { category: "CAREER OPTIONS", title: "ARTIFICIAL INTELLIGENCE", icon: "🤖" },

    { category: "DESIGNERS", title: "DESIGNER", icon: "🎨" },
    { category: "DESIGNERS", title: "FASHION DESIGNER", icon: "👗" },
    { category: "DESIGNERS", title: "FURNITURE DESIGNER", icon: "🪑" },
    { category: "DESIGNERS", title: "USER INTERFACE DESIGNER", icon: "🖥️" },
    { category: "DESIGNERS", title: "LEATHER DESIGNER", icon: "👜" },
    { category: "DESIGNERS", title: "INTERIOR DESIGNER", icon: "🏠" },
    { category: "DESIGNERS", title: "ANIMATION DESIGNER", icon: "🎬" },
    { category: "DESIGNERS", title: "DIE DESIGNER", icon: "⚙️" },
    { category: "DESIGNERS", title: "ARCHITECT DESIGNER", icon: "🏛️" },

    { category: "HANDCRAFTS", title: "HANDCRAFTS", icon: "🧶" },
    { category: "IRON AND STEEL", title: "IRON AND STEEL", icon: "🏗️" },
    { category: "WOOD AND PANEL", title: "WOOD AND PANEL PRODUCTS TECHNOLOGY", icon: "🪵" },
    { category: "GAMING INDUSTRY", title: "GAMING INDUSTRY", icon: "🎮" },
    { category: "FORENSIC SCIENCE", title: "FORENSIC SCIENCE", icon: "🔬" },
    { category: "NUTRITION AND DIETETICS", title: "NUTRITION AND DIETETICS", icon: "🥗" },
    { category: "CLAT", title: "CLAT ENTRANCE EXAM", icon: "⚖️" },
    { category: "TOURISM INDUSTRY", title: "TOURISM INDUSTRY", icon: "✈️" },
    { category: "INSTITUTE OF CHARTERED ACCOUNTANTS OF INDIA", title: "INSTITUTE OF CHARTERED ACCOUNTANTS OF INDIA", icon: "📊" },
    { category: "INSTITUTE OF COMPANY SECRETARIES OF INDIA (ICSI)", title: "INSTITUTE OF COMPANY SECRETARIES OF INDIA (ICSI)", icon: "📚" },
    { category: "NEET", title: "NATIONAL ELIGIBILITY CUM ENTRANCE TEST (NEET)", icon: "🩺" },
    { category: "JOURNALISM", title: "JOURNALISM", icon: "📰" },
    { category: "POLAR SCIENCE", title: "POLAR SCIENCE", icon: "❄️" },
    { category: "LOGISTICS MANAGEMENT", title: "LOGISTICS MANAGEMENT", icon: "🚚" },
    { category: "ADVERTISING PROFESSIONAL", title: "ADVERTISING PROFESSIONAL", icon: "📢" },
    { category: "PHARMACEUTICAL SECTOR", title: "PHARMACEUTICAL SECTOR", icon: "💊" },
    { category: "RADIOLOGY", title: "RADIOLOGY", icon: "🩻" },
    { category: "RETAIL BUSINESS", title: "RETAIL BUSINESS", icon: "🛍️" },
    { category: "METEOROLOGY", title: "METEOROLOGY", icon: "🌦️" },
    { category: "CERAMIC TECHNOLOGY", title: "CERAMIC TECHNOLOGY", icon: "🏺" },
    { category: "EARTH SCIENCE", title: "EARTH SCIENCE", icon: "🌍" },
    { category: "FISHERIES AND ORNAMENTAL FISH CULTURE", title: "FISHERIES AND ORNAMENTAL FISH CULTURE", icon: "🐟" },
    { category: "FINTECH AND CAREERS IN THE FINANCIAL WORLD", title: "FINTECH AND CAREERS IN THE FINANCIAL WORLD", icon: "💹" }
  ]

  // Navigation menu data
  const navigationMenus = [
    {
      id: "home",
      label: "Home",
      items: [
        "About Us",
        "Organizational Chart",
        "Scope",
        "Activities",
        "Schemes",
        "Downloadable Forms",
        "Departmental GO's",
        "Departmental Books",
        "Statistics",
        "Cutoff Seniority Dates"
      ]
    },
    {
      id: "aspirant",
      label: "Job Aspirant",
      items: [
        "Guidelines to Registrants",
        "Government / Public Sector",
        "Private Sectors",
        "Competitive Exams",
        "Skill Training"
      ]
    },
    {
      id: "employer",
      label: "Employer",
      items: [
        "Government",
        "Private Sector"
      ]
    },
    {
      id: "emi",
      label: "EMI",
      items: [
        "About EMI",
        "ER-I Return Filing"
      ]
    },
    {
      id: "guidance",
      label: "Career Guidance",
      items: [
        "Career Information",
        "Career Booklets",
        "Study Circle",
        "Virtual Learning System Portal",
        "State Career Guidance Centre",
        "Psychometric Tool",
        "Advertised Vacancies"
      ]
    },
    {
      id: "contact",
      label: "Contact Us",
      items: [
        "Directorate",
        "RJD Offices",
        "DECGCS",
        "CGC for SC/ST",
        "SCGC",
        "Website Information Manager",
        "Public Information Officers & Appellate Authority",
        "Employment Department PIO"
      ]
    },
    {
      id: "login",
      label: "Login",
      items: [
        "Job Aspirants",
        "Employer",
        "Admin"
      ]
    }
  ]


const handleNavigationItem = (menuId, item) => {
  setOpenMenu(null)

  if (menuId === "emi" && item === "About EMI") {
    document.getElementById("emi")?.scrollIntoView({
      behavior: "smooth"
    })
    return
  }

  if (menuId === "guidance" && item === "Career Information") {
    document.getElementById("careers")?.scrollIntoView({
      behavior: "smooth"
    })
    return
  }

  if (menuId === "guidance" && item === "Advertised Vacancies") {
    document.getElementById("latest-news-title")?.scrollIntoView({
      behavior: "smooth"
    })
    return
  }

  if (menuId === "contact" && item === "Directorate") {
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth"
    })
    return
  }

  alert(
    `${item} is a demonstration menu option. Detailed content is not available in this demo.`
  )
}


  return (
    <div className="app career-home" id="home">

      {/* Government-style top information bar */}
<div className="top-strip">
  <div className="top-strip-left">
    <span>DEPARTMENT OF EMPLOYMENT AND TRAINING, GOVT OF TAMIL NADU</span>
    <span className="top-strip-divider">|</span>
    <span className="top-strip-tamil">வேலைவாய்ப்பு மற்றும் பயிற்சித் துறை, தமிழ்நாடு அரசு</span>
  </div>
</div>

{/* Government-style navigation */}
<header className="career-navbar"></header>


      {/* Government-style navigation */}
      <header className="career-navbar">
        <a className="career-brand" href="#home" aria-label="TN CareerConnect Home">
          <div className="brand-emblem">
            <span>TN</span>
          </div>

          <div className="brand-name">
            <strong>வேலைவாய்ப்பு மற்றும் பயிற்சித்துறை</strong>
            <small>DEPARTMENT OF EMPLOYMENT AND TRAINING</small>
          </div>
        </a>

        <nav className="career-nav-links" aria-label="Main navigation">
          {navigationMenus.map((menu) => (
            <div className="nav-dropdown" key={menu.id}>
              <button
                type="button"
                className={
                  openMenu === menu.id
                    ? "nav-menu-button active"
                    : "nav-menu-button"
                }
                onClick={() => {
                  setOpenMenu(openMenu === menu.id ? null : menu.id)
                }}
                aria-expanded={openMenu === menu.id}
              >
                {menu.label}
                <span className="nav-arrow">⌄⌄</span>
              </button>

              {openMenu === menu.id && (
                <div
                  className={
                    menu.id === "contact"
                      ? "nav-dropdown-content contact-dropdown"
                      : "nav-dropdown-content"
                  }
                >
                  {menu.items.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => {
                        if (menu.id === "login") {
  setOpenMenu(null)

  if (item === "Job Aspirants") {
    setCurrentPage("login")
  } else if (item === "Employer") {
    setCurrentPage("employerLogin")
  } else if (item === "Admin") {
    setCurrentPage("adminLogin")
  }

  return
}

                        handleNavigationItem(menu.id, item)
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </header>

      {/* Hero banner */}
      <section className="government-hero" id="hero">
        <div
          className="hero-photo-panel"
          aria-label="Career application and employment services"
        >
          <div className="hero-photo-overlay">
            <span className="hero-photo-caption">
              EMPLOYMENT & CAREER SERVICES
            </span>
          </div>
        </div>

        <div className="hero-content-panel">
          <div className="hero-pattern" aria-hidden="true">
            ⚙ ◉ ⚙ ◉ ⚙
          </div>

          <h1>
            <span>•</span> Dream <span>•</span> Discover <span>•</span> Decide <span>•</span>
          </h1>

          <h2>
            A unique platform to discover your dream careers
          </h2>

          <div className="hero-bottom-message">
            A website interlinking employment services towards consistent guidance
            to job seekers and students to explore and achieve career goals
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="latest-news-section" aria-labelledby="latest-news-title">
        <h2 id="latest-news-title">Latest News</h2>

        <div className="heading-decoration">
          <span></span>
          <b>●</b>
          <span></span>
        </div>

        <div className="latest-news-grid">
          <article className="latest-news-item">
            <span className="news-category">JOB SEEKERS</span>
            <h3>Candidate Registration</h3>
            <p>
              Create your profile and explore employment opportunities through TN CareerConnect.
            </p>
            <button onClick={() => setCurrentPage("register")}>
              Register Now →
            </button>
          </article>

          <article className="latest-news-item">
            <span className="news-category">EMPLOYERS</span>
            <h3>Employer Services</h3>
            <p>
              Employers can register, publish job vacancies and review candidate applications.
            </p>
            <button onClick={() => setCurrentPage("employerRegister")}>
              Employer Registration →
            </button>
          </article>

          <article className="latest-news-item">
            <span className="news-category">CAREER SERVICES</span>
            <h3>Career Guidance</h3>
            <p>
              Explore career information, skill development and useful guidance for your next step.
            </p>
            <a href="#guidance">View Guidance →</a>
          </article>
        </div>
      </section>

      {/* Career Information */}
      <main className="career-main" id="careers">
        <div className="career-heading">
          <h1>Career Information</h1>
          <p>
            Explore different career opportunities and learn about
            professional fields.
          </p>
        </div>

        <div className="career-grid">
          {careers.map((career, index) => (
            <div className="career-card" key={index}>
              <div className="career-icon">
                <span>{career.icon}</span>
              </div>

              <div className="career-card-content">
                <span>{career.category}</span>
                <h2>{career.title}</h2>
              </div>

              <div className="career-card-corner">
                <span>↓</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* EMI Calculator */}
      <section className="emi-section" id="emi">
        <div className="section-heading">
          <span>FINANCIAL INFORMATION</span>
          <h2>Education Loan EMI Calculator</h2>
          <p>
            Calculate an illustrative monthly instalment based on
            loan amount, interest rate and repayment period.
          </p>
        </div>

        <div className="emi-container">
          <form className="emi-form" onSubmit={calculateEMI}>
            <label>Loan Amount (₹)</label>
            <input
              type="number"
              min="1"
              value={loanAmount}
              onChange={(e) => {
                setLoanAmount(e.target.value)
                setEmi(null)
              }}
              required
            />

            <label>Annual Interest Rate (%)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={interestRate}
              onChange={(e) => {
                setInterestRate(e.target.value)
                setEmi(null)
              }}
              required
            />

            <label>Loan Duration (Months)</label>
            <input
              type="number"
              min="1"
              value={loanDuration}
              onChange={(e) => {
                setLoanDuration(e.target.value)
                setEmi(null)
              }}
              required
            />

            <button type="submit">Calculate EMI</button>
          </form>

          <div className="emi-result">
            <span>ESTIMATED MONTHLY EMI</span>

            <h3>
              {emi !== null
                ? `₹${emi.toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                  })}`
                : "₹ —"}
            </h3>

            <p>
              This is a sample calculation only. Actual loan terms
              depend on the lending institution.
            </p>

            {emi !== null && (
              <div className="emi-total">
                <p>Total repayment amount</p>
                <strong>
                  ₹{(emi * Number(loanDuration)).toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                  })}
                </strong>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Career Guidance */}
      <section className="guidance-section" id="guidance">
        <div className="section-heading">
          <span>CAREER SERVICES</span>
          <h2>Career Guidance</h2>
          <p>
            Information and useful guidance for students and job seekers.
          </p>
        </div>

        <div className="guidance-grid">
          <article className="guidance-card">
            <div className="guidance-icon">🎯</div>
            <h3>Career Planning</h3>
            <p>
              Identify your interests, strengths and abilities.
              Choose a career path that matches your goals.
            </p>
          </article>

          <article className="guidance-card">
            <div className="guidance-icon">📄</div>
            <h3>Resume Preparation</h3>
            <p>
              Prepare a professional resume highlighting your
              education, skills, projects and achievements.
            </p>
          </article>

          <article className="guidance-card">
            <div className="guidance-icon">🤝</div>
            <h3>Interview Preparation</h3>
            <p>
              Improve your communication, practise interview
              questions and prepare to explain your experience.
            </p>
          </article>

          <article className="guidance-card">
            <div className="guidance-icon">💡</div>
            <h3>Skill Development</h3>
            <p>
              Develop technical and professional skills through
              training, certifications and practical projects.
            </p>
          </article>

          <article className="guidance-card">
            <div className="guidance-icon">🏢</div>
            <h3>Employment Opportunities</h3>
            <p>
              Explore job vacancies, internships, apprenticeships
              and recruitment opportunities.
            </p>
          </article>

          <article className="guidance-card">
            <div className="guidance-icon">🚀</div>
            <h3>Career Development</h3>
            <p>
              Set professional goals, gain work experience and
              continue learning to improve your career prospects.
            </p>
          </article>
        </div>
      </section>

      {/* Contact Us */}
      <section className="contact-section" id="contact">
        <div className="section-heading">
          <span>PUBLIC SUPPORT</span>
          <h2>Contact Us</h2>
          <p>
            Use the demonstration form to practise submitting an enquiry.
          </p>
        </div>

        <div className="contact-container">
          <div className="contact-details">
            <h3>Contact Information</h3>
            <p>TN CareerConnect – Sample information</p>

            <div className="contact-detail-item">
              <span>📧</span>
              <div>
                <strong>Email</strong>
                <p>support@tncareerconnect.example</p>
              </div>
            </div>

            <div className="contact-detail-item">
              <span>📞</span>
              <div>
                <strong>Phone</strong>
                <p>+91 90000 00000 (Demo number)</p>
              </div>
            </div>

            <div className="contact-detail-item">
              <span>📍</span>
              <div>
                <strong>Address</strong>
                <p>Chennai, Tamil Nadu, India (Sample location)</p>
              </div>
            </div>

            <p className="demo-note">
              These are sample details for demonstration.
              They are not official government contact details.
            </p>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <h3>Submit an Enquiry</h3>

            <label>Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={contactForm.name}
              onChange={handleContactChange}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={contactForm.email}
              onChange={handleContactChange}
              required
            />

            <label>Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="Enter subject"
              value={contactForm.subject}
              onChange={handleContactChange}
              required
            />

            <label>Message</label>
            <textarea
              name="message"
              rows="4"
              placeholder="Enter your message"
              value={contactForm.message}
              onChange={handleContactChange}
              required
            />

            <button type="submit">Submit Enquiry</button>

            {contactMessage && (
              <p className="contact-feedback">{contactMessage}</p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="career-footer">
        <h3>TN CareerConnect</h3>
        <p>
          Career Information and Employment Opportunities
        </p>
        <p>
          Home | Career Information | EMI Calculator |
          Career Guidance | Contact Us
        </p>
        <p>© 2026 TN CareerConnect. All Rights Reserved.</p>
        <small>
          Independent demonstration portal. Not an official Government of Tamil Nadu website.
        </small>
      </footer>

    </div>
  )
}

export default App
