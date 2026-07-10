# 🎓 EduManage — School Management System

A full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) web application for managing student records, fee payments, document storage, and certificate generation for schools.

---

## ✨ Features

### 📊 Dashboard
- Total students, new admissions, pending fees at a glance
- Recent admissions table & pending fee alerts
- Quick student search

### 📝 Admission Management
- Multi-section admission form (30+ fields)
- Auto-generated admission numbers (`ADM-2026-0001`)
- Upload documents (Photo, Aadhaar, Birth Certificate, TC, Other)

### 👨‍🎓 Student Directory
- Search by name, admission number, class, or mobile
- Filter by class, section, and status
- Paginated student table with view/edit/delete actions

### 📄 Student Profile
- Tabbed interface: Profile Info | Documents | Fee Details | Certificates
- View/download uploaded documents
- Edit student information

### 💰 Fee Management
- Set total fee per student
- Record multiple installment payments (Cash, UPI, Bank Transfer, Cheque)
- Track paid vs pending amounts with progress bar
- Auto-generated receipt numbers (`RCP-2026-0001`)
- Download fee receipts as PDF

### 📜 Certificate Generation
- **Bonafide Certificate** — auto-filled from student profile
- **Transfer Certificate (TC)** — 25-field format (English only)
  - Fields 1–13 auto-filled from profile (read-only)
  - Fields 14–25 editable by staff
- Download certificates as PDF

### 👨‍🏫 Teachers & Timetable
- Manage teacher profiles, subjects, and assigned classes
- Class-wise weekly timetable generation
- View individual teacher schedules

### 📈 Academic Results
- Enter subject-wise marks for students
- Auto-calculation of totals, percentages, and grades
- View class-wise and individual student performance reports

### ⚙️ School Settings
- Configure school name, address, and details
- Used in certificate headers and receipts

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React.js | 19.2 |
| Build Tool | Vite | 8.1 |
| Styling | Tailwind CSS | v4.3 |
| Backend | Express.js | 4.21 |
| Database | MongoDB Atlas | — |
| ODM | Mongoose | 8.7 |
| Runtime | Node.js | 18+ |

### Key Libraries

**Backend:** `cors` · `helmet` · `morgan` · `multer` · `puppeteer` · `express-validator` · `uuid` · `dayjs` · `dotenv`

**Frontend:** `axios` · `react-router-dom` · `react-icons` · `react-hot-toast` · `html2pdf.js` · `dayjs`

---

## 📁 Project Structure

```
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/layout/  # Layout, Sidebar, Header
│   │   ├── pages/              # Dashboard, Admission, Students,
│   │   │                       # FeeManagement, Certificates, etc.
│   │   ├── services/api.js     # Axios API functions
│   │   ├── App.jsx             # React Router config
│   │   └── index.css           # Tailwind CSS imports
│   ├── vite.config.js          # Vite config with proxy
│   └── package.json
│
├── server/                     # Express Backend
│   ├── config/db.js            # MongoDB connection
│   ├── models/                 # Mongoose schemas (9 models)
│   ├── controllers/            # Business logic (10 controllers)
│   ├── routes/                 # API route definitions (10 routes)
│   ├── middleware/             # Error handler, Multer upload config
│   ├── templates/              # HTML templates for PDF generation
│   ├── uploads/                # Uploaded files (per student)
│   ├── server.js               # App entry point
│   └── .env                    # Environment variables
│
└── README.md
```

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| `Student` | Student info — personal, academic, parent, address (30+ fields) |
| `Document` | Uploaded file metadata (type, filename, path) |
| `FeeRecord` | Total fee per student, linked to payments |
| `Payment` | Individual payment entries with receipt numbers |
| `Certificate` | Generated certificate records (Bonafide, TC) |
| `Teacher` | Teacher personal info, subjects, and assigned classes |
| `Timetable` | Class and teacher weekly schedule entries |
| `Result` | Student examination marks and grades |
| `SchoolSetting` | School name, address, configuration |

---

## 🔌 API Endpoints

| Resource | Routes |
|----------|--------|
| Students | `POST /api/students` · `GET /api/students` · `GET /api/students/:id` · `PUT /api/students/:id` · `DELETE /api/students/:id` · `GET /api/students/next-admission-number` |
| Documents | `POST /api/documents/upload/:studentId` · `GET /api/documents/:studentId` · `DELETE /api/documents/:id` |
| Fees | `POST /api/fees` · `GET /api/fees/:studentId` · `PUT /api/fees/:id` |
| Payments | `POST /api/payments` · `GET /api/payments/:studentId` |
| Certificates | `POST /api/certificates/bonafide/:studentId` · `POST /api/certificates/tc/:studentId` · `GET /api/certificates/:studentId` |
| Teachers | `POST /api/teachers` · `GET /api/teachers` · `GET /api/teachers/:id` · `PUT /api/teachers/:id` · `DELETE /api/teachers/:id` · `GET /api/teachers/next-id` |
| Timetable | `POST /api/timetable/bulk` · `GET /api/timetable` · `GET /api/timetable/teacher/:teacherId` · `DELETE /api/timetable/:id` |
| Results | `POST /api/results` · `GET /api/results` · `GET /api/results/student/:studentId` · `PUT /api/results/:id` · `DELETE /api/results/:id` |
| Dashboard | `GET /api/dashboard/stats` |
| Settings | `GET /api/settings` · `PUT /api/settings` |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB Atlas** account ([free tier](https://www.mongodb.com/atlas))
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ranjan-hegde/students-details-management.git
cd students-details-management

# 2. Set up the Backend
cd server
npm install

# 3. Configure environment variables
# Edit .env and add your MongoDB Atlas URI:
#   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/school_management
#   PORT=5000
#   NODE_ENV=development

# 4. Start the backend server
npm run dev

# 5. In a NEW terminal, set up the Frontend
cd client
npm install
npm run dev
```

### Access the App
Open **http://localhost:5173** in your browser.

---

## 📸 Screenshots

> Coming soon

---

## 📄 Documentation

A detailed technical documentation is available in the project root:
- **`EduManage_Technical_Documentation.pdf`** — Complete tech stack breakdown, architecture diagrams, database schema, API reference, and feature walkthroughs.

---

## 👤 Author

**Ranjan Hegde**

- GitHub: [@ranjan-hegde](https://github.com/ranjan-hegde)

---

## 📝 License

This project is for educational purposes.
