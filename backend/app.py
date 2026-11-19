
import os
import mysql.connector
import bcrypt
import uuid
from functools import wraps
from werkzeug.utils import secure_filename
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt

# Load environment variables from backend/.env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)

# Resume Upload Configuration
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "resumes")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

ALLOWED_EXTENSIONS = {"pdf"}

def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError("JWT_SECRET_KEY is missing from the .env file")
jwt = JWTManager(app)
CORS(app)


# MySQL connection
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306))
    )


# Admin Role Protection
def admin_required():
    def decorator(function):
        @wraps(function)
        def wrapper(*args, **kwargs):
            claims = get_jwt()

            user_role = str(
                claims.get("role", "")
            ).strip().lower()

            allowed_roles = ["admin", "super admin"]

            if user_role not in allowed_roles:
                return jsonify({
                    "status": "error",
                    "message": "Admin access only"
                }), 403

            return function(*args, **kwargs)

        return wrapper

    return decorator


# Home route
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "success",
        "message": "Job Portal Backend is Running!"
    })


# API test route
@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({
        "status": "success",
        "message": "Flask API is working correctly"
    })


# Candidate Registration API
@app.route("/api/register", methods=["POST"])
def register_candidate():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([full_name, email, phone, password]):
        return jsonify({
            "status": "error",
            "message": "All required fields must be filled"
        }), 400

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO candidates
            (full_name, email, phone, password_hash)
            VALUES (%s, %s, %s, %s)
        """

        cursor.execute(
            sql,
            (full_name, email, phone, password_hash)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Candidate registered successfully!"
        }), 201

    except mysql.connector.IntegrityError:
        return jsonify({
            "status": "error",
            "message": "This email is already registered"
        }), 409

    except Exception:
        app.logger.exception("Candidate registration failed")
        return jsonify({
            "status": "error",
            "message": "Registration failed"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Candidate Login API
@app.route("/api/login", methods=["POST"])
def candidate_login():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT candidate_id, full_name, email, password_hash FROM candidates WHERE email = %s",
            (email,)
        )

        candidate = cursor.fetchone()

        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            candidate["password_hash"].encode("utf-8")
        ):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        access_token = create_access_token(
            identity=str(candidate["candidate_id"]),
            additional_claims={
                "role": "Candidate",
                "email": candidate["email"]
            }
        )

        return jsonify({
            "status": "success",
            "message": "Login successful!",
            "access_token": access_token,
            "candidate": {
                "candidate_id": candidate["candidate_id"],
                "full_name": candidate["full_name"],
                "email": candidate["email"]
            }
        }), 200

    except Exception:
        app.logger.exception("Candidate login failed")
        return jsonify({
            "status": "error",
            "message": "Login failed"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Employer Registration API
@app.route("/api/employer/register", methods=["POST"])
def register_employer():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    company_name = data.get("company_name")
    contact_person = data.get("contact_person")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([company_name, contact_person, email, phone, password]):
        return jsonify({
            "status": "error",
            "message": "All required fields must be filled"
        }), 400

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO employers
            (company_name, contact_person, email, phone, password_hash)
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(
            sql,
            (company_name, contact_person, email, phone, password_hash)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Employer registered successfully!",
            "approval_status": "Pending"
        }), 201

    except mysql.connector.IntegrityError:
        return jsonify({
            "status": "error",
            "message": "This email is already registered"
        }), 409

    except Exception:
        app.logger.exception("Employer registration failed")
        return jsonify({
            "status": "error",
            "message": "Employer registration failed"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Employer Login API
@app.route("/api/employer/login", methods=["POST"])
def employer_login():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT employer_id, company_name, contact_person,
                   email, password_hash, approval_status
            FROM employers
            WHERE email = %s
            """,
            (email,)
        )

        employer = cursor.fetchone()

        if not employer:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            employer["password_hash"].encode("utf-8")
        ):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if employer["approval_status"] != "Approved":
            return jsonify({
                "status": "error",
                "message": "Your account is awaiting admin approval",
                "approval_status": employer["approval_status"]
            }), 403

        access_token = create_access_token(
            identity=str(employer["employer_id"]),
            additional_claims={
                "role": "Employer",
                "email": employer["email"]
            }
        )

        return jsonify({
            "status": "success",
            "message": "Employer login successful!",
            "access_token": access_token,
            "employer": {
                "employer_id": employer["employer_id"],
                "company_name": employer["company_name"],
                "contact_person": employer["contact_person"],
                "email": employer["email"]
            }
        }), 200

    except Exception:
        app.logger.exception("Employer login failed")
        return jsonify({
            "status": "error",
            "message": "Employer login failed"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

# Admin Login API
@app.route("/api/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT admin_id, full_name, email, password_hash, role
            FROM admins
            WHERE email = %s
            """,
            (email,)
        )

        admin = cursor.fetchone()

        if not admin:
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        if not bcrypt.checkpw(
            password.encode("utf-8"),
            admin["password_hash"].encode("utf-8")
        ):
            return jsonify({
                "status": "error",
                "message": "Invalid email or password"
            }), 401

        access_token = create_access_token(
            identity=str(admin["admin_id"]),
            additional_claims={
                "role": admin["role"],
                "email": admin["email"]
            }
        )

        return jsonify({
            "status": "success",
            "message": "Admin login successful!",
            "access_token": access_token,
            "admin": {
                "admin_id": admin["admin_id"],
                "full_name": admin["full_name"],
                "email": admin["email"],
                "role": admin["role"]
            }
        }), 200

    except Exception:
        app.logger.exception("Admin login failed")
        return jsonify({
            "status": "error",
            "message": "Admin login failed"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
# View All Candidates API
@app.route("/api/admin/candidates", methods=["GET"])
@jwt_required()
@admin_required()
def get_all_candidates():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                candidate_id,
                full_name,
                email,
                phone,
                date_of_birth,
                gender,
                qualification,
                skills,
                experience_years,
                created_at
            FROM candidates
            ORDER BY created_at DESC
        """)

        candidates = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_candidates": len(candidates),
            "candidates": candidates
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch candidates")
        return jsonify({
            "status": "error",
            "message": "Unable to fetch candidates"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

 # View All Employers API
@app.route("/api/admin/employers", methods=["GET"])
@jwt_required()
@admin_required()
def get_all_employers():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                employer_id,
                company_name,
                contact_person,
                email,
                phone,
                industry,
                company_website,
                company_address,
                approval_status,
                created_at
            FROM employers
            ORDER BY created_at DESC
        """)

        employers = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_employers": len(employers),
            "employers": employers
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch employers")
        return jsonify({
            "status": "error",
            "message": "Unable to fetch employers"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


  # Update Employer Approval Status API
@app.route("/api/admin/employers/<int:employer_id>/status", methods=["PUT"])
@jwt_required()
@admin_required()
def update_employer_status(employer_id):
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    approval_status = data.get("approval_status")

    if approval_status not in ["Approved", "Rejected"]:
        return jsonify({
            "status": "error",
            "message": "Status must be Approved or Rejected"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE employers
            SET approval_status = %s
            WHERE employer_id = %s
            """,
            (approval_status, employer_id)
        )

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Employer not found"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": f"Employer {approval_status.lower()} successfully",
            "approval_status": approval_status
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update employer status")

        return jsonify({
            "status": "error",
            "message": "Unable to update employer status"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

    # View All Jobs API
@app.route("/api/admin/jobs", methods=["GET"])
@jwt_required()
@admin_required()
def get_all_jobs():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                j.job_id,
                j.employer_id,
                e.company_name,
                j.job_title,
                j.job_category,
                j.job_type,
                j.location,
                j.salary_min,
                j.salary_max,
                j.qualification,
                j.experience_required,
                j.application_deadline,
                j.job_status,
                j.created_at
            FROM jobs j
            JOIN employers e ON j.employer_id = e.employer_id
            ORDER BY j.created_at DESC
        """)

        jobs = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_jobs": len(jobs),
            "jobs": jobs
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch jobs")
        return jsonify({
            "status": "error",
            "message": "Unable to fetch jobs"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

    # Update Job Approval Status API
@app.route("/api/admin/jobs/<int:job_id>/status", methods=["PUT"])
@jwt_required()
@admin_required()
def update_job_status(job_id):
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    job_status = data.get("job_status")

    if job_status not in ["Approved", "Rejected"]:
        return jsonify({
            "status": "error",
            "message": "Status must be Approved or Rejected"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE jobs
            SET job_status = %s
            WHERE job_id = %s
            """,
            (job_status, job_id)
        )

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": f"Job {job_status.lower()} successfully",
            "job_status": job_status
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update job status")

        return jsonify({
            "status": "error",
            "message": "Unable to update job status"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

    # View All Job Applications API
@app.route("/api/admin/applications", methods=["GET"])
@jwt_required()
@admin_required()
def get_all_applications():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                ja.application_id,
                ja.candidate_id,
                c.full_name AS candidate_name,
                c.email AS candidate_email,
                ja.job_id,
                j.job_title,
                e.company_name,
                ja.application_status,
                ja.applied_at
            FROM job_applications ja
            JOIN candidates c
                ON ja.candidate_id = c.candidate_id
            JOIN jobs j
                ON ja.job_id = j.job_id
            JOIN employers e
                ON j.employer_id = e.employer_id
            ORDER BY ja.applied_at DESC
        """)

        applications = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_applications": len(applications),
            "applications": applications
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch applications")
        return jsonify({
            "status": "error",
            "message": "Unable to fetch applications"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

    # Update Application Status API
@app.route("/api/admin/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
@admin_required()
def update_application_status(application_id):
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    application_status = data.get("application_status")

    allowed_statuses = [
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Selected"
    ]

    if application_status not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid application status"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE job_applications
            SET application_status = %s
            WHERE application_id = %s
            """,
            (application_status, application_id)
        )

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Application not found"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Application status updated successfully",
            "application_status": application_status
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update application status")

        return jsonify({
            "status": "error",
            "message": "Unable to update application status"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

     # View All Job Fairs API
@app.route("/api/admin/job-fairs", methods=["GET"])
@jwt_required()
@admin_required()
def get_all_job_fairs():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("""
            SELECT
                job_fair_id,
                event_name,
                description,
                organizer,
                location,
                event_date,
                start_time,
                end_time,
                registration_link,
                event_status
            FROM job_fairs
            ORDER BY event_date DESC
        """)

        job_fairs = cursor.fetchall()
        for fair in job_fairs:
            if fair["start_time"] is not None:
                fair["start_time"] = str(fair["start_time"])

            if fair["end_time"] is not None:
                fair["end_time"] = str(fair["end_time"])
        return jsonify({
            "status": "success",
            "total_job_fairs": len(job_fairs),
            "job_fairs": job_fairs
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch job fairs")
        return jsonify({
            "status": "error",
            "message": "Unable to fetch job fairs"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()

            # Add Job Fair API
@app.route("/api/admin/job-fairs", methods=["POST"])
@jwt_required()
@admin_required()
def add_job_fair():
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    event_name = data.get("event_name")
    event_date = data.get("event_date")

    if not event_name or not event_date:
        return jsonify({
            "status": "error",
            "message": "Event name and event date are required"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO job_fairs (
                event_name,
                description,
                organizer,
                location,
                event_date,
                start_time,
                end_time,
                registration_link,
                event_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            event_name,
            data.get("description"),
            data.get("organizer"),
            data.get("location"),
            event_date,
            data.get("start_time"),
            data.get("end_time"),
            data.get("registration_link"),
            "Upcoming"
        ))

        job_fair_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job fair added successfully!",
            "job_fair_id": job_fair_id
        }), 201

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to add job fair")

        return jsonify({
            "status": "error",
            "message": "Unable to add job fair"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            # Update Job Fair API
@app.route("/api/admin/job-fairs/<int:job_fair_id>", methods=["PUT"])
@jwt_required()
@admin_required()
def update_job_fair(job_fair_id):
    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid request data"
        }), 400

    allowed_statuses = [
        "Upcoming",
        "Ongoing",
        "Completed",
        "Cancelled"
    ]

    event_status = data.get("event_status")

    if event_status and event_status not in allowed_statuses:
        return jsonify({
            "status": "error",
            "message": "Invalid event status"
        }), 400

    fields = [
        "event_name",
        "description",
        "organizer",
        "location",
        "event_date",
        "start_time",
        "end_time",
        "registration_link",
        "event_status"
    ]

    updates = []
    values = []

    for field in fields:
        if field in data:
            updates.append(f"{field} = %s")
            values.append(data[field])

    if not updates:
        return jsonify({
            "status": "error",
            "message": "No fields provided to update"
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = (
            "UPDATE job_fairs SET "
            + ", ".join(updates)
            + " WHERE job_fair_id = %s"
        )

        values.append(job_fair_id)
        cursor.execute(query, tuple(values))

        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT job_fair_id FROM job_fairs WHERE job_fair_id = %s",
                (job_fair_id,)
            )

            if not cursor.fetchone():
                return jsonify({
                    "status": "error",
                    "message": "Job fair not found"
                }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job fair updated successfully!"
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update job fair")

        return jsonify({
            "status": "error",
            "message": "Unable to update job fair"
        }), 500

    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()


# Employer Job Posting API
@app.route("/api/employer/jobs", methods=["POST"])
@jwt_required()
def post_job():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())

        data = request.get_json()

        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid request data"
            }), 400

        required_fields = [
            "job_title",
            "job_description",
            "job_category",
            "job_type",
            "location"
        ]

        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    "status": "error",
                    "message": f"{field} is required"
                }), 400

        allowed_job_types = [
            "Full Time",
            "Part Time",
            "Internship",
            "Contract"
        ]

        if data["job_type"] not in allowed_job_types:
            return jsonify({
                "status": "error",
                "message": "Invalid job type"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT approval_status FROM employers WHERE employer_id = %s",
            (employer_id,)
        )

        employer = cursor.fetchone()

        if not employer or employer["approval_status"] != "Approved":
            return jsonify({
                "status": "error",
                "message": "Employer account is not approved"
            }), 403

        cursor.execute(
            """
            INSERT INTO jobs (
                employer_id,
                job_title,
                job_description,
                job_category,
                job_type,
                location,
                salary_min,
                salary_max,
                qualification,
                experience_required,
                skills_required,
                application_deadline,
                job_status
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'Pending')
            """,
            (
                employer_id,
                data["job_title"],
                data["job_description"],
                data["job_category"],
                data["job_type"],
                data["location"],
                data.get("salary_min"),
                data.get("salary_max"),
                data.get("qualification"),
                data.get("experience_required"),
                data.get("skills_required"),
                data.get("application_deadline")
            )
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job posted successfully! Awaiting admin approval",
            "job_id": cursor.lastrowid,
            "job_status": "Pending"
        }), 201

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Job posting failed")

        return jsonify({
            "status": "error",
            "message": "Unable to post job"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Employer View Own Jobs API
@app.route("/api/employer/jobs", methods=["GET"])
@jwt_required()
def get_employer_jobs():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                job_id,
                job_title,
                job_description,
                job_category,
                job_type,
                location,
                salary_min,
                salary_max,
                qualification,
                experience_required,
                skills_required,
                application_deadline,
                job_status,
                created_at
            FROM jobs
            WHERE employer_id = %s
            ORDER BY created_at DESC
            """,
            (employer_id,)
        )

        jobs = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_jobs": len(jobs),
            "jobs": jobs
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch employer jobs")

        return jsonify({
            "status": "error",
            "message": "Unable to fetch employer jobs"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Employer Update Job API
@app.route("/api/employer/jobs/<int:job_id>", methods=["PUT"])
@jwt_required()
def update_employer_job(job_id):
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())
        data = request.get_json()

        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid request data"
            }), 400

        allowed_fields = [
            "job_title",
            "job_description",
            "job_category",
            "job_type",
            "location",
            "salary_min",
            "salary_max",
            "qualification",
            "experience_required",
            "skills_required",
            "application_deadline"
        ]

        updates = {
            field: data[field]
            for field in allowed_fields
            if field in data
        }

        if not updates:
            return jsonify({
                "status": "error",
                "message": "No valid fields provided for update"
            }), 400

        if "job_type" in updates and updates["job_type"] not in [
            "Full Time", "Part Time", "Internship", "Contract"
        ]:
            return jsonify({
                "status": "error",
                "message": "Invalid job type"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            "SELECT job_id FROM jobs WHERE job_id = %s AND employer_id = %s",
            (job_id, employer_id)
        )

        if not cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "Job not found or access denied"
            }), 404

        set_clause = ", ".join(
            f"{field} = %s" for field in updates
        )

        values = list(updates.values())
        values.extend([job_id, employer_id])

        cursor.execute(
            f"""
            UPDATE jobs
            SET {set_clause}, job_status = 'Pending'
            WHERE job_id = %s AND employer_id = %s
            """,
            tuple(values)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job updated successfully! Awaiting admin approval"
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update employer job")

        return jsonify({
            "status": "error",
            "message": "Unable to update job"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# Employer Close Job API
@app.route("/api/employer/jobs/<int:job_id>/close", methods=["PUT"])
@jwt_required()
def close_employer_job(job_id):
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            UPDATE jobs
            SET job_status = 'Closed'
            WHERE job_id = %s AND employer_id = %s
            """,
            (job_id, employer_id)
        )

        if cursor.rowcount == 0:
            connection.rollback()
            return jsonify({
                "status": "error",
                "message": "Job not found or access denied"
            }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job closed successfully"
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to close employer job")

        return jsonify({
            "status": "error",
            "message": "Unable to close job"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

            # Candidate Job Search API
@app.route("/api/jobs", methods=["GET"])
def search_jobs():
    connection = None
    cursor = None

    try:
        keyword = request.args.get("keyword", "").strip()
        location = request.args.get("location", "").strip()
        category = request.args.get("category", "").strip()

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT
                job_id,
                job_title,
                job_description,
                job_category,
                job_type,
                location,
                salary_min,
                salary_max,
                qualification,
                experience_required,
                skills_required,
                created_at
            FROM jobs
            WHERE job_status = 'Approved'
        """

        values = []

        if keyword:
            query += """
                AND (
                    job_title LIKE %s
                    OR job_description LIKE %s
                    OR skills_required LIKE %s
                )
            """
            search_value = f"%{keyword}%"
            values.extend([search_value, search_value, search_value])

        if location:
            query += " AND location LIKE %s"
            values.append(f"%{location}%")

        if category:
            query += " AND job_category = %s"
            values.append(category)

        query += " ORDER BY created_at DESC"

        cursor.execute(query, tuple(values))
        jobs = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_jobs": len(jobs),
            "jobs": jobs
        }), 200

    except Exception:
        app.logger.exception("Failed to search jobs")

        return jsonify({
            "status": "error",
            "message": "Unable to search jobs"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

            # Candidate Job Details API
@app.route("/api/jobs/<int:job_id>", methods=["GET"])
def get_job_details(job_id):
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                job_id,
                job_title,
                job_description,
                job_category,
                job_type,
                location,
                salary_min,
                salary_max,
                qualification,
                experience_required,
                skills_required,
                application_deadline,
                created_at
            FROM jobs
            WHERE job_id = %s
            AND job_status = 'Approved'
            """,
            (job_id,)
        )

        job = cursor.fetchone()

        if not job:
            return jsonify({
                "status": "error",
                "message": "Job not found or not available"
            }), 404

        return jsonify({
            "status": "success",
            "job": job
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch job details")

        return jsonify({
            "status": "error",
            "message": "Unable to fetch job details"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Candidate Apply for Job API
@app.route("/api/jobs/<int:job_id>/apply", methods=["POST"])
@jwt_required()
def apply_for_job(job_id):
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())
        data = request.get_json(silent=True) or {}

        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid request data"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check whether the job is approved
        cursor.execute(
            """
            SELECT job_id
            FROM jobs
            WHERE job_id = %s AND job_status = 'Approved'
            """,
            (job_id,)
        )

        if not cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "Job not found or not available"
            }), 404

        # Check whether candidate already applied
        cursor.execute(
            """
            SELECT application_id
            FROM job_applications
            WHERE candidate_id = %s AND job_id = %s
            """,
            (candidate_id, job_id)
        )

        if cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "You have already applied for this job"
            }), 409

        # Submit application
        cursor.execute(
            """
            INSERT INTO job_applications (
                candidate_id,
                job_id,
                cover_letter,
                application_status
            )
            VALUES (%s, %s, %s, 'Applied')
            """,
            (
                candidate_id,
                job_id,
                data.get("cover_letter")
            )
        )

        application_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job application submitted successfully",
            "application_id": application_id,
            "application_status": "Applied"
        }), 201

    except mysql.connector.IntegrityError:
        if connection:
            connection.rollback()

        return jsonify({
            "status": "error",
            "message": "You have already applied for this job"
        }), 409

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to submit job application")

        return jsonify({
            "status": "error",
            "message": "Unable to submit job application"
        }), 500

    finally:
        try:
            if cursor:
                cursor.close()
        except Exception:
            app.logger.exception("Error closing application cursor")

        try:
            if connection and connection.is_connected():
                connection.close()
        except Exception:
            app.logger.exception("Error closing application database connection")


            # Candidate Application History API
@app.route("/api/candidate/applications", methods=["GET"])
@jwt_required()
def get_candidate_applications():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                ja.application_id,
                ja.job_id,
                ja.application_status,
                ja.cover_letter,
                ja.applied_at,
                j.job_title,
                j.job_category,
                j.job_type,
                j.location,
                e.company_name
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.job_id
            JOIN employers e ON j.employer_id = e.employer_id
            WHERE ja.candidate_id = %s
            ORDER BY ja.applied_at DESC
            """,
            (candidate_id,)
        )

        applications = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_applications": len(applications),
            "applications": applications
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch candidate applications")

        return jsonify({
            "status": "error",
            "message": "Unable to fetch application history"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# Candidate Save Job API
@app.route("/api/candidate/saved-jobs", methods=["POST"])
@jwt_required()
def save_job():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid request data"
            }), 400

        job_id = data.get("job_id")

        if not job_id:
            return jsonify({
                "status": "error",
                "message": "Job ID is required"
            }), 400

        try:
            job_id = int(job_id)
            if job_id <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return jsonify({
                "status": "error",
                "message": "Invalid job ID"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT job_id
            FROM jobs
            WHERE job_id = %s
            AND job_status = 'Approved'
            """,
            (job_id,)
        )

        job = cursor.fetchone()

        if not job:
            return jsonify({
                "status": "error",
                "message": "Job not found"
            }), 404

        cursor.execute(
            """
            SELECT saved_job_id
            FROM saved_jobs
            WHERE candidate_id = %s AND job_id = %s
            """,
            (candidate_id, job_id)
        )

        existing = cursor.fetchone()

        if existing:
            return jsonify({
                "status": "error",
                "message": "You have already saved this job"
            }), 409

        cursor.execute(
            """
            INSERT INTO saved_jobs (candidate_id, job_id)
            VALUES (%s, %s)
            """,
            (candidate_id, job_id)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Job saved successfully!"
        }), 201

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to save job")

        return jsonify({
            "status": "error",
            "message": "Unable to save job"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# Candidate Get Saved Jobs API
@app.route("/api/candidate/saved-jobs", methods=["GET"])
@jwt_required()
def get_saved_jobs():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        query = """
    SELECT
        j.*,
        e.company_name
    FROM saved_jobs sj
    JOIN jobs j
        ON sj.job_id = j.job_id
    JOIN employers e
        ON j.employer_id = e.employer_id
    WHERE sj.candidate_id = %s
    ORDER BY j.created_at DESC
"""

        cursor.execute(query, (candidate_id,))
        saved_jobs = cursor.fetchall()

        return jsonify({
            "status": "success",
            "saved_jobs": saved_jobs
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch saved jobs")

        return jsonify({
            "status": "error",
            "message": "Unable to load saved jobs"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()



            # Candidate Remove Saved Job API
@app.route("/api/candidate/saved-jobs/<int:job_id>", methods=["DELETE"])
@jwt_required()
def remove_saved_job(job_id):
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM saved_jobs
            WHERE candidate_id = %s AND job_id = %s
            """,
            (candidate_id, job_id)
        )

        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "status": "error",
                "message": "Saved job not found"
            }), 404

        return jsonify({
            "status": "success",
            "message": "Saved job removed successfully"
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to remove saved job")

        return jsonify({
            "status": "error",
            "message": "Unable to remove saved job"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

            # Candidate Profile API
@app.route("/api/candidate/profile", methods=["GET"])
@jwt_required()
def get_candidate_profile():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                candidate_id,
                full_name,
                email,
                phone,
                date_of_birth,
                gender,
                qualification,
                skills,
                experience_years,
                resume_path,
                created_at
            FROM candidates
            WHERE candidate_id = %s
            """,
            (candidate_id,)
        )

        candidate = cursor.fetchone()

        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Candidate not found"
            }), 404

        return jsonify({
            "status": "success",
            "profile": candidate
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch candidate profile")

        return jsonify({
            "status": "error",
            "message": "Unable to fetch candidate profile"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# Candidate Update Profile API
@app.route("/api/candidate/profile", methods=["PUT"])
@jwt_required()
def update_candidate_profile():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid request data"
            }), 400

        allowed_fields = [
            "full_name",
            "phone",
            "date_of_birth",
            "gender",
            "qualification",
            "skills",
            "experience_years"
        ]

        updates = {
            field: data[field]
            for field in allowed_fields
            if field in data
        }

        if not updates:
            return jsonify({
                "status": "error",
                "message": "No profile details provided"
            }), 400

        if "full_name" in updates and not updates["full_name"]:
            return jsonify({
                "status": "error",
                "message": "Full name cannot be empty"
            }), 400

        if "experience_years" in updates:
            try:
                updates["experience_years"] = float(
                    updates["experience_years"]
                )

                if updates["experience_years"] < 0:
                    raise ValueError
            except (ValueError, TypeError):
                return jsonify({
                    "status": "error",
                    "message": "Invalid experience years"
                }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        set_clause = ", ".join(
            f"{field} = %s" for field in updates
        )

        values = list(updates.values())
        values.append(candidate_id)

        cursor.execute(
            f"""
            UPDATE candidates
            SET {set_clause}
            WHERE candidate_id = %s
            """,
            tuple(values)
        )

        if cursor.rowcount == 0:
            cursor.execute(
                "SELECT candidate_id FROM candidates WHERE candidate_id = %s",
                (candidate_id,)
            )

            if not cursor.fetchone():
                return jsonify({
                    "status": "error",
                    "message": "Candidate not found"
                }), 404

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Profile updated successfully"
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update candidate profile")

        return jsonify({
            "status": "error",
            "message": "Unable to update candidate profile"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

            # Candidate Resume Upload API
@app.route("/api/candidate/resume", methods=["POST"])
@jwt_required()
def upload_candidate_resume():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())

        if "resume" not in request.files:
            return jsonify({
                "status": "error",
                "message": "No resume file provided"
            }), 400

        file = request.files["resume"]

        if file.filename == "":
            return jsonify({
                "status": "error",
                "message": "No file selected"
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                "status": "error",
                "message": "Only PDF files are allowed"
            }), 400

        file.seek(0)
        if file.read(5) != b"%PDF-":
            return jsonify({
                "status": "error",
                "message": "Invalid PDF file"
            }), 400

        file.seek(0)

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT resume_path
            FROM candidates
            WHERE candidate_id = %s
            """,
            (candidate_id,)
        )

        candidate = cursor.fetchone()

        if not candidate:
            return jsonify({
                "status": "error",
                "message": "Candidate not found"
            }), 404

        filename = secure_filename(file.filename)
        unique_filename = f"{candidate_id}_{uuid.uuid4().hex}_{filename}"

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            unique_filename
        )

        file.save(file_path)

        relative_path = os.path.join(
            "uploads", "resumes", unique_filename
        ).replace("\\", "/")

        cursor.execute(
            """
            UPDATE candidates
            SET resume_path = %s
            WHERE candidate_id = %s
            """,
            (relative_path, candidate_id)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Resume uploaded successfully",
            "resume_path": relative_path
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to upload candidate resume")

        return jsonify({
            "status": "error",
            "message": "Unable to upload resume"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()

# Candidate Resume Download API
@app.route("/api/candidate/resume/download", methods=["GET"])
@jwt_required()
def download_candidate_resume():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Candidate":
            return jsonify({
                "status": "error",
                "message": "Candidate access only"
            }), 403

        candidate_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT resume_path
            FROM candidates
            WHERE candidate_id = %s
            """,
            (candidate_id,)
        )

        candidate = cursor.fetchone()

        if not candidate or not candidate["resume_path"]:
            return jsonify({
                "status": "error",
                "message": "No resume uploaded"
            }), 404

        filename = os.path.basename(candidate["resume_path"])

        return send_from_directory(
            app.config["UPLOAD_FOLDER"],
            filename,
            as_attachment=True
        )

    except Exception:
        app.logger.exception("Resume download failed")

        return jsonify({
            "status": "error",
            "message": "Unable to download resume"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Employer Download Applicant Resume API
@app.route(
    "/api/employer/applications/<int:application_id>/resume",
    methods=["GET"]
)
@jwt_required()
def download_applicant_resume(application_id):
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT c.resume_path
            FROM job_applications ja
            JOIN jobs j
                ON ja.job_id = j.job_id
            JOIN candidates c
                ON ja.candidate_id = c.candidate_id
            WHERE ja.application_id = %s
              AND j.employer_id = %s
            """,
            (application_id, employer_id)
        )

        application = cursor.fetchone()

        if not application or not application["resume_path"]:
            return jsonify({
                "status": "error",
                "message": "Resume not found or access denied"
            }), 404

        filename = os.path.basename(application["resume_path"])

        return send_from_directory(
            app.config["UPLOAD_FOLDER"],
            filename,
            as_attachment=True
        )

    except Exception:
        app.logger.exception("Employer resume download failed")

        return jsonify({
            "status": "error",
            "message": "Unable to download applicant resume"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()



# Employer View Applicants API
@app.route("/api/employer/applicants", methods=["GET"])
@jwt_required()
def get_employer_applicants():
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())

        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                ja.application_id,
                ja.application_status,
                ja.cover_letter,
                ja.applied_at,
                c.candidate_id,
                c.full_name,
                c.email,
                c.phone,
                c.qualification,
                c.skills,
                c.experience_years,
                c.resume_path,
                j.job_id,
                j.job_title
            FROM job_applications ja
            JOIN candidates c
                ON ja.candidate_id = c.candidate_id
            JOIN jobs j
                ON ja.job_id = j.job_id
            WHERE j.employer_id = %s
            ORDER BY ja.applied_at DESC
            """,
            (employer_id,)
        )

        applicants = cursor.fetchall()

        return jsonify({
            "status": "success",
            "total_applicants": len(applicants),
            "applicants": applicants
        }), 200

    except Exception:
        app.logger.exception("Failed to fetch employer applicants")

        return jsonify({
            "status": "error",
            "message": "Unable to fetch applicants"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Employer Update Application Status API
@app.route("/api/employer/applications/<int:application_id>/status", methods=["PUT"])
@jwt_required()
def update_employer_application_status(application_id):
    connection = None
    cursor = None

    try:
        claims = get_jwt()

        if claims.get("role") != "Employer":
            return jsonify({
                "status": "error",
                "message": "Employer access only"
            }), 403

        employer_id = int(get_jwt_identity())
        data = request.get_json(silent=True)

        if not isinstance(data, dict):
            return jsonify({
                "status": "error",
                "message": "Invalid request data"
            }), 400

        new_status = data.get("application_status")

        allowed_statuses = [
            "Applied",
            "Under Review",
            "Shortlisted",
            "Rejected",
            "Selected"
        ]

        if new_status not in allowed_statuses:
            return jsonify({
                "status": "error",
                "message": "Invalid application status"
            }), 400

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT ja.application_id
            FROM job_applications ja
            JOIN jobs j ON ja.job_id = j.job_id
            WHERE ja.application_id = %s
            AND j.employer_id = %s
            """,
            (application_id, employer_id)
        )

        if not cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "Application not found or access denied"
            }), 404

        cursor.execute(
            """
            UPDATE job_applications
            SET application_status = %s
            WHERE application_id = %s
            """,
            (new_status, application_id)
        )

        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Application status updated successfully",
            "application_status": new_status
        }), 200

    except Exception:
        if connection:
            connection.rollback()

        app.logger.exception("Failed to update application status")

        return jsonify({
            "status": "error",
            "message": "Unable to update application status"
        }), 500

    finally:
        if cursor:
            cursor.close()

        if connection and connection.is_connected():
            connection.close()


# Database test route
@app.route("/api/db-test", methods=["GET"])
def db_test():
    connection = None

    try:
        connection = get_db_connection()

        return jsonify({
            "status": "success",
            "message": "MySQL database connected successfully!"
        })

    except Exception:
        app.logger.exception("Database connection failed")

        return jsonify({
            "status": "error",
            "message": "MySQL connection failed. Check the backend terminal for details."
        }), 500

    finally:
        if connection and connection.is_connected():
            connection.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
