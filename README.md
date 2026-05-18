<h1 align="center">🚀 AtomQuest Goal Tracking Portal</h1>

<p align="center">
A Full-Stack Goal Setting & Tracking Portal built for the AtomQuest Hackathon 1.0.
</p>

<p align="center">
Built using the MERN Stack with role-based workflows for Employees, Managers, and Admins.
</p>

---

# 📌 Problem Statement

Organizations often struggle with fragmented goal tracking systems involving spreadsheets, emails, and manual review cycles.  
AtomQuest solves this problem by providing a centralized digital platform for:

- Goal Creation & Approval
- Quarterly Achievement Tracking
- Real-time Progress Visibility
- Audit Logging
- Team & Employee Performance Monitoring

---

# ✨ Features

## 👨‍💼 Employee Module
- Create Goal Sheets
- Add Goal Title & Description
- Select UoM Types
- Set Targets & Weightage
- Submit Goals for Approval
- Quarterly Achievement Updates
- Status Tracking (Not Started / On Track / Completed)

---

## 👨‍💻 Manager Module
- Review Submitted Goals
- Approve / Reject Goals
- Inline Goal Editing
- Add Check-in Comments
- Monitor Team Performance
- View Planned vs Actual Achievements

---

## 🛡️ Admin Module
- Manage Users & Roles
- Unlock Locked Goals
- View Audit Logs
- Monitor Completion Rates
- Access Organization-wide Reports

---

# 📊 Goal Validation Rules

The system enforces the following business rules:

- ✅ Total Goal Weightage must equal 100%
- ✅ Minimum Weightage per Goal = 10%
- ✅ Maximum Goals per Employee = 8
- ✅ Locked Goals cannot be edited after approval
- ✅ Shared Goals support multi-user alignment

---

# 📈 Achievement Tracking

Supports multiple Unit of Measurement (UoM) types:

| UoM Type | Description |
|----------|-------------|
| Numeric | Higher achievement is better |
| Percentage | Progress-based targets |
| Timeline | Deadline-based tracking |
| Zero-based | Zero incident success metrics |

---

# 📅 Quarterly Check-in Workflow

| Phase | Timeline |
|------|-----------|
| Goal Setting | May |
| Q1 Check-in | July |
| Q2 Check-in | October |
| Q3 Check-in | January |
| Annual Review | March / April |

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Context API

---

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

## Other Tools
- Git & GitHub
- Postman
- VS Code

---

# 📂 Project Structure

```bash
AtomQuest/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Backend Setup

## Navigate to Backend

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Start Backend Server

```bash
npm run start
```

## Seed Demo Data

```bash
npm run seed
```

## Load Raw Dataset

```bash
npm run load:raw
```

Backend runs on:

```bash
http://localhost:5001
```

---

# 💻 Frontend Setup

## Navigate to Frontend

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Start Frontend

```bash
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🔐 Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=5000
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=atomquestsecret
```

---

5. Test Login Credentials
Role	Email	Password
ADMIN	admin@test.com	Admin@123
MANAGER 1	alice.manager@test.com	Manager@123
MANAGER 2	bob.manager@test.com	Manager@123
EMPLOYEE 1	john.emp@test.com	Emp@123
EMPLOYEE 2	sarah.emp@test.com	Emp@123


---

# 🔌 API Endpoints

## Authentication
```http
POST /api/auth/register
POST /api/auth/login
```

## Goals
```http
POST /api/goals
GET /api/goals
PUT /api/goals/submit/:id
```

## Manager APIs
```http
GET /api/manager/submitted
PUT /api/manager/approve/:id
PUT /api/manager/reject/:id
```

## Admin APIs
```http
GET /api/admin/users
GET /api/admin/goals
```

## Check-ins
```http
POST /api/checkins
```

---

# 📊 Reporting & Governance

- Achievement Reports
- Completion Dashboard
- Audit Trail Logs
- Goal Approval Tracking
- Quarterly Performance Monitoring

---

# 🌟 Bonus Features

- Shared Goals System
- Role-Based Access Control
- JWT Authentication
- Goal Locking Mechanism
- Audit Logging
- Responsive Dashboard UI

---

# 📸 Screenshots

Add project screenshots here.

Example:


<img width="1497" height="952" alt="Screenshot 2026-05-17 204210" src="https://github.com/user-attachments/assets/0cfe51eb-ac14-49c1-b81e-12dc94e62434" />
<img width="1907" height="938" alt="Screenshot 2026-05-17 204240" src="https://github.com/user-attachments/assets/ad0e179c-89de-445d-8e22-5840be14553e" />
<img width="1879" height="903" alt="Screenshot 2026-05-17 204305" src="https://github.com/user-attachments/assets/f6c244fa-626e-438c-9c1c-a5065c0a4b01" />
<img width="1472" height="885" alt="Screenshot 2026-05-17 204323" src="https://github.com/user-attachments/assets/62953e67-c819-47dc-ac68-db1703d11fea" />
<img width="1608" height="898" alt="Screenshot 2026-05-17 204347" src="https://github.com/user-attachments/assets/731349fa-d23a-4c9a-a5d5-4f2d4b9db3fa" />
<img width="1677" height="687" alt="Screenshot 2026-05-17 204945" src="https://github.com/user-attachments/assets/b2f47c1b-09a4-4e5c-b352-33e8dba33e5b" />

---

# 🚀 Future Improvements

- Microsoft Entra ID (Azure AD) Integration
- Email Notifications
- Microsoft Teams Integration
- Escalation Workflow
- Analytics Dashboard
- Performance Heatmaps
- Export Reports (CSV/Excel)

---

# 🧠 Architecture Overview

The application follows a modern MERN architecture:

- React Frontend for UI
- Express & Node.js Backend APIs
- MongoDB Database
- JWT-based Authentication
- RESTful API Design

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request



# 👨‍💻 Developer

<b>Sumit Kumar</b>  
B.Tech ECE (IIOT)  
NIT Kurukshetra  
MERN Stack Developer

---
