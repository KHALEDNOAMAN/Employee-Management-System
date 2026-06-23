<div align="center">

# ðŸ‘¥ Employee Management System

**Full-Stack HR Platform with Attendance, Leave Management & Department Analytics**

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A comprehensive Employee Management System built during a software engineering internship. Features employee CRUD with soft delete, attendance tracking with check-in/out, leave management with approval workflows, department hierarchy with recursive CTEs, and an analytics dashboard.

</div>

---

## âœ¨ Features

- ðŸ‘¤ **Employee Management** - Full CRUD with multi-step wizard, profile pages, soft delete
- â° **Attendance Tracking** - Daily check-in/check-out with status tracking and hours calculation
- ðŸ“‹ **Leave Management** - Request, approve, reject workflow with balance tracking
- ðŸ¢ **Department Hierarchy** - Org chart with recursive CTE queries and tree visualization
- ðŸ“Š **Analytics Dashboard** - Headcount, attendance rates, leave utilization charts
- ðŸ” **Search & Filter** - Debounced search, department/status/type filters, server-side pagination
- ðŸ“¸ **File Upload** - Avatar upload with Multer (5MB limit, image validation)
- ðŸ—‘ï¸ **Soft Delete** - deleted_at timestamp pattern, data never truly lost
- ðŸ§® **Working Days Calculator** - Excludes weekends and Turkish public holidays
- ðŸ‡¹ðŸ‡· **Turkish Localization** - Turkish names, phone formats (+90), TRY currency

## ðŸ—ï¸ Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ React Frontendâ”‚â”€â”€â”€â”€â–¶â”‚ Express.js API   â”‚â”€â”€â”€â”€â–¶â”‚ PostgreSQL   â”‚
â”‚ (Chart.js)    â”‚     â”‚ (JWT + RBAC)     â”‚     â”‚ (9 tables)   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

## ðŸ“ Project Structure

```
Employee-Management-System/
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ controllers/     # Request handlers (5 controllers)
â”‚   â”‚   â”œâ”€â”€ services/        # Business logic (4 services)
â”‚   â”‚   â”œâ”€â”€ routes/          # API routes (5 route files)
â”‚   â”‚   â”œâ”€â”€ middleware/      # Auth, upload, error handling
â”‚   â”‚   â””â”€â”€ utils/           # Helpers, working days calculator
â”‚   â”œâ”€â”€ migrations/          # 6 database migrations
â”‚   â”œâ”€â”€ seeds/               # Sample data (20 Turkish employees)
â”‚   â””â”€â”€ tests/               # Unit tests
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/      # 8 React components
â”‚   â”‚   â”œâ”€â”€ hooks/           # Custom hooks
â”‚   â”‚   â”œâ”€â”€ services/        # API layer
â”‚   â”‚   â””â”€â”€ utils/           # Formatters
â””â”€â”€ README.md
```

## ðŸ—„ï¸ Database Schema (9 Tables)

| Table | Description | Key Columns |
|-------|-------------|-------------|
| departments | Department hierarchy | parent_id (self-ref), budget |
| positions | Job positions | salary range, pay grade |
| employees | Core employee data | 25+ columns, soft delete |
| attendance_records | Daily check-in/out | UNIQUE(employee, date) |
| leave_requests | Leave with workflow | status: pending/approved/rejected |
| leave_balances | Annual balances | per type, per year |
| salary_history | Compensation changes | old/new salary, reason |
| employee_documents | File attachments | type, path, size |
| employee_notes | Internal notes | author tracking |

## ðŸ“¡ API Endpoints

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List (search, filter, paginate) |
| GET | `/api/employees/:id` | Get profile with relations |
| POST | `/api/employees` | Create new employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Soft delete |

### Attendance & Leave
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/check-in` | Record check-in |
| POST | `/api/attendance/check-out` | Record check-out |
| POST | `/api/leave` | Submit leave request |
| PUT | `/api/leave/:id/approve` | Approve (deducts balance) |
| PUT | `/api/leave/:id/reject` | Reject with notes |

## ðŸš€ Getting Started

```bash
git clone https://github.com/KHALEDNOAMAN/Employee-Management-System.git
cd Employee-Management-System/backend
npm install && cp .env.example .env
npx knex migrate:latest && npx knex seed:run
npm run dev
```

## ðŸ“ License

MIT License - see [LICENSE](LICENSE) file.

---

<div align="center">
  Built with â¤ï¸ during internship at EduTech Yazilim A.S. - Istanbul, Turkey
</div>
