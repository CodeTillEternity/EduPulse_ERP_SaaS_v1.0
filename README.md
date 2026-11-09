# EduPulse — Enterprise Multi-Tenant Institutional ERP SaaS

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15_Alpine-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7_Alpine-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage_Alpine-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-Automated_CI%2FCD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)

**EduPulse** (`Institutional_ERP_v1.0`) is a production-grade, multi-tenant Software-as-a-Service (SaaS) Enterprise Resource Planning (ERP) platform built for universities, colleges, and educational conglomerates. It provides automated tenant data isolation, role-based access control (RBAC), physical asset logistics, and integrated B2C fee payment settlement via Razorpay.

---

## 🏛️ System Architecture

```
                                  +-----------------------------+
                                  |   Web Browser / Client UI   |
                                  +--------------+--------------+
                                                 |
                                     HTTP:80 / HTTPS:443
                                                 v
                       +-----------------------------------------------+
                       |          Nginx Reverse Proxy / SPA            |
                       |  (React 19, Vite, TanStack Query, Tailwind)   |
                       +-----------------------+-----------------------+
                                               |
                                     Upstream: /api/ -> :8081
                                               v
+---------------------------------------------------------------------------------------------+
|                             Spring Boot 3.3.4 Backend Server                                |
|                                                                                             |
|   +-----------------------+   +-----------------------+   +-----------------------------+   |
|   |  Multi-Tenant Scoping |   |   Security & RBAC     |   |    REST API Controllers     |   |
|   | (TenantContext & RLS) |   | (JJWT & Method Sec)   |   | (Academic, Finance, Ops...) |   |
|   +-----------+-----------+   +-----------+-----------+   +--------------+--------------+   |
|               |                           |                              |                  |
|               +---------------------------+------------------------------+                  |
|                                           |                                                 |
|                                           v                                                 |
|                       +---------------------------------------+                             |
|                       |  Spring Data JPA / Hibernate Layer    |                             |
|                       |   (BaseTenantEntity automatic filter) |                             |
|                       +-------------------+-------------------+                             |
+-------------------------------------------|-------------------------------------------------+
                                            |
                         +------------------+------------------+
                         |                                     |
                         v                                     v
          +------------------------------+      +------------------------------+
          |    PostgreSQL 15 Database    |      |    Redis 7 Distributed Cache |
          | (Multi-Tenant Scoped Schema) |      | (Sessions, Tokens, Rates)    |
          +------------------------------+      +------------------------------+
```

---

## 🛡️ Multi-Tenancy & Data Isolation

EduPulse enforces strict multi-tenant boundary isolation at every layer:

1. **Discriminator Column Pattern with `BaseTenantEntity`**:
   Every persistent domain entity extends `BaseTenantEntity`, guaranteeing that `tenantId` is stamped automatically upon creation and checked on queries.
2. **Context-Aware Scoping with `TenantContext`**:
   A `ThreadLocal`-backed context extracts tenant identity from incoming JWT claims and `X-Tenant-ID` HTTP headers, binding the execution lifecycle to the authorized tenant.
3. **Database-Level Protection**:
   Configured for PostgreSQL Row-Level Security (RLS) policies, preventing cross-tenant leakage even under raw SQL execution.
4. **Role-Based Access Control (RBAC)**:
   Fine-grained method security using `@PreAuthorize` restricts endpoints based on roles (`SUPERADMIN`, `ADMIN`, `FACULTY`, `FINANCE_MANAGER`, `HR_MANAGER`, `LIBRARIAN`, `TRANSPORT_MANAGER`, and `STUDENT`).

---

## 📦 Core Functional Modules

### 1. 🎓 Academic Core & Admissions
- Institutional Department, Program, Semester, Curriculum, and Course catalog management.
- Course Offering schedules with Faculty instructor assignments and student course registrations.
- Student applicant inquiry, enrollment verification, and guardian linkage.

### 2. 📅 Operations: Timetable & Attendance
- **Timetable Scheduling**: Room allocation, day-of-week slots, and clash detection for course batches.
- **Attendance Tracker**: Daily attendance logging with states (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`), real-time percentage aggregation, and batch-level reporting.

### 3. 📝 Examinations, Grading & Transcripts
- **Exam Management**: Scheduling midterms, finals, and practical assessments with maximum mark thresholds.
- **Grade Scale Engine**: GPA conversion matrix (`A+` = 4.0, `A` = 3.75, etc.) with automated letter grade calculation.
- **Official Transcripts**: Cumulative GPA (CGPA) computation and formatted student grade sheet exports.

### 4. 💳 Student Finance & Invoicing
- **Fee Structures**: Configurable tuition, laboratory, and library fee heads mapped to academic batches.
- **Invoicing Lifecycle**: Automated student invoice generation with status tracking (`PAID`, `PARTIAL`, `UNPAID`, `OVERDUE`).
- **Student Ledger**: Complete financial audit trail detailing invoices, receipts, and outstanding dues.

### 5. ⚡ B2C SaaS Billing & Razorpay Integration
- **RBI-Compliant Checkout**: Native Razorpay order creation for tuition and fee payments.
- **Webhook Settlement Gateway**: HMAC-SHA256 signature verification ensuring automated invoice clearance upon payment capture.
- **Subscription Lockout**: Tenant-level subscription enforcement restricting overdue institutions.

### 6. 👥 HR & Faculty Payroll
- **Leave Management**: Faculty leave application lifecycle with approval and rejection workflows.
- **Automated Payroll**: Monthly salary calculation deducting unpaid leaves and generating itemized pay slips.

### 7. 📚 Enterprise Operations: Library & Transport
- **Library Catalog & Circulation**:
  - Book asset inventory tracking with ISBN, title, and total/available copy counts.
  - Lending circulation workflows with automatic inventory decrement and return tracking.
- **Transport & Fleet Logistics**:
  - Vehicle registry with registration numbers, seating capacities, and driver details.
  - Commuter route mapping with pickup stops and monthly fare calculations.
  - Real-time seating capacity KPI indicators (e.g., *"42/50 Seats Filled"*) with visual progress thresholds preventing overbooking.

### 8. 📱 Student Self-Service Portal (`/portal`)
- **Restricted Access**: Scoped exclusively to the authenticated student's tenant and student ID.
- **Aggregated Dashboard**: Today's timetable schedule, unpaid fee alerts, and GPA performance snapshots.
- **Fee Center**: Integrated Razorpay modal checkout allowing direct digital payments.

---

## 💻 Tech Stack

| Domain | Technology | Version / Details |
|---|---|---|
| **Backend Framework** | Spring Boot | 3.3.4 (Java 21 LTS) |
| **Persistence** | Spring Data JPA / Hibernate | 6.5 (PostgreSQL Dialect) |
| **Migrations** | Flyway | Baseline-enabled schema evolution |
| **Security** | Spring Security + JJWT | Bearer JWT, HMAC-SHA256, Method Security |
| **Frontend Framework** | React | 19.x with TypeScript & Vite 8.3 |
| **Client State** | TanStack Query v5 + Zustand | Query caching & global auth persistence |
| **Styling & Components** | Tailwind CSS + Lucide Icons | Responsive UI with Sonner toast alerts |
| **Database** | PostgreSQL | 15 Alpine (Persistent Volume) |
| **Cache & Sessions** | Redis | 7 Alpine (Internal VPC access) |
| **Containerization** | Docker | Multi-stage minimal Alpine images |
| **Orchestration** | Docker Compose | Multi-container isolated bridge network |
| **CI/CD Pipeline** | GitHub Actions | Automated build, test, and container packaging |
| **Cloud IaC** | Render.com | Blueprint specification (`render.yaml`) |

---

## 🚀 Local Deployment with Docker Compose

Follow these steps to run the complete EduPulse ecosystem locally with a single command.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v24.0+ recommended)
- [Docker Compose](https://docs.docker.com/compose/) (v2.20+ recommended)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/CodeTillEternity/EduPulse_ERP_SaaS_v1.0.git
cd EduPulse_ERP_SaaS_v1.0
```

### 2. Configure Environment Variables
Copy the example environment template:
```bash
cp .env.example .env
```
*(Optional: Customize `.env` to configure ports, database credentials, or Razorpay API keys).*

### 3. Launch Services
Run the multi-container stack in detached mode:
```bash
docker compose up -d --build
```

### 4. Verify Service Health
Check that all four containers are running and healthy:
```bash
docker compose ps
```

| Service | Container Name | Port Mapping | Health Status |
|---|---|---|---|
| **PostgreSQL** | `edupulse-postgres` | `5432:5432` | `healthy` (`pg_isready`) |
| **Redis** | `edupulse-redis` | `6379:6379` | `healthy` (`redis-cli ping`) |
| **Backend** | `edupulse-backend` | `8081:8081` | `healthy` (`/actuator/health`) |
| **Frontend** | `edupulse-frontend` | `80:80` | `healthy` (`HTTP 200`) |

### 5. Access the Application
- **Frontend Web Application**: [http://localhost](http://localhost) (or port 80)
- **Backend API & Health**: [http://localhost:8081/actuator/health](http://localhost:8081/actuator/health)
- **API Documentation (Swagger UI)**: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html) *(in dev profile)*

### 6. Stop Services
To stop and preserve container data:
```bash
docker compose down
```
To stop and wipe persistent volumes:
```bash
docker compose down -v
```

---

## ☁️ Cloud Deployment on Render.com

EduPulse includes native Infrastructure-as-Code (IaC) via [`render.yaml`](./render.yaml).

1. Connect your GitHub repository to [Render.com](https://render.com/).
2. Create a new **Blueprint Instance** and select the repository.
3. Render will automatically provision:
   - Managed PostgreSQL database (`edupulse-postgres`)
   - Managed Redis instance (`edupulse-redis`)
   - Dockerized Spring Boot Web Service (`edupulse-backend`) with `SPRING_PROFILES_ACTIVE=cloud`
   - Node-built React Static Site (`edupulse-frontend`) with SPA rewrites

---

## 🛠️ Development & Testing

### Backend Unit & Integration Tests
```bash
cd backend
./mvnw clean test
```

### Frontend Unit Tests & Build
```bash
cd frontend-v2
npm install
npm test
npm run build
```

---

## 📜 145-Commit Architectural Roadmap

```
Commits 001 - 040: Academic Core Architecture (Departments, Faculty, Courses, Students, Curricula)
Commits 041 - 075: Multi-Tenant PostgreSQL RLS & Schema Discriminator Isolation
Commits 076 - 105: Authentication, RBAC, and Institution SaaS Onboarding Workflows
Commits 106 - 110: Academic Operations (Timetable Scheduling & Daily Student Attendance)
Commits 111 - 115: Student Finance (FeeHeads, FeeStructures, Student Invoicing & Payments)
Commits 116 - 120: HR & Payroll (Faculty Leave Applications & Monthly Payroll Disbursement)
Commits 121 - 125: Examination & Grading (Assessments, Grade Scales, GPA Calculation & Transcripts)
Commits 126 - 130: B2C Student Portal (Aggregated Dashboard & Live Razorpay Fee Checkout)
Commits 131 - 135: Enterprise Operations (Library Catalog & Transport Fleet Capacity Logistics)
Commits 136 - 140: DevOps Containerization (Docker Alpine Images, Docker Compose & GitHub Actions)
Commits 141 - 145: Cloud Deployment Engineering (Render IaC, Dynamic Cloud Routing & Master Docs)
```

---

## 📄 License
This project is proprietary software developed under the EduPulse Institutional ERP SaaS initiative. All rights reserved.
