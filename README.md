# TN CareerConnect

TN CareerConnect is a job portal web application designed to connect job seekers, employers, and administrators.

## Project Modules

### Candidate
- Candidate registration and login
- Manage profile
- Search and view jobs
- Apply for jobs
- Save jobs
- Upload resume
- Track applications

### Employer
- Employer registration and login
- Post job vacancies
- Manage job postings
- View applicants
- Update application status

### Admin
- Admin login
- View candidates
- Manage employers
- Manage jobs
- Manage applications
- Manage job fairs

## Technologies Used

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, Flask
- **Database:** MySQL
- **Version Control:** Git

## Project Structure

```text
TN-CareerConnect/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .gitignore
│   └── uploads/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Requirements

Install the following software before running the project:

- Python
- Node.js and npm
- MySQL Server
- MySQL Workbench (optional)

## Running the Project Locally

### 1. Configure the Backend

Open a terminal and navigate to the backend directory:

```powershell
cd backend
```

Activate the Python virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required Python packages:

```powershell
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory and configure the MySQL connection details and JWT secret using the variable names required by the backend application.

### 2. Start the Backend

From the backend directory, run:

```powershell
python app.py
```

The backend runs at:

```text
http://127.0.0.1:5000
```

### 3. Start the Frontend

Open a second terminal and navigate to the frontend directory:

```powershell
cd frontend
```

Install the frontend dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Open the local development URL displayed in the terminal by Vite.

## Important Notes

- MySQL Server must be running and the required database must be configured before using the application.
- Do not upload `.env` files, passwords, JWT secrets, private tokens, or uploaded resumes to GitHub.
- The `node_modules/` and Python virtual environment folders are not required in the GitHub repository.
- This project is intended for local development and demonstration.