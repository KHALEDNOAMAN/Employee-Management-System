<div align="center">

# 👥 Employee Management System

**Full-Stack HR Platform with Attendance, Leave Management & Department Analytics**

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

A comprehensive Employee Management System built during a software engineering internship. Features employee CRUD with soft delete, attendance tracking with check-in/out, leave management with approval workflows, department hierarchy with recursive CTEs, and an analytics dashboard.

</div>

---

## ✨ Features

- 👤 **Employee Management** - Full CRUD with multi-step wizard, profile pages, soft delete
- ⏰ **Attendance Tracking** - Daily check-in/check-out with status tracking and hours calculation
- 🌴 **Leave Management** - Request, approve, reject workflow with balance tracking
- 🏢 **Department Hierarchy** - Org chart with recursive CTE queries and tree visualization
- 📊 **Analytics Dashboard** - Headcount, attendance rates, leave utilization charts
- 🔍 **Search & Filter** - Debounced search, department/status/type filters, server-side pagination
- 📷 **File Upload** - Avatar upload with Multer (5MB limit, image validation)
- 🗑️ **Soft Delete** - deleted_at timestamp pattern, data never truly lost
- 📅 **Working Days Calculator** - Excludes weekends and Turkish public holidays
- 🇹🇷 **Turkish Localization** - Turkish names, phone formats (+90), TRY currency

## 🏗️ Architecture

```
┌───────────────┐     ┌──────────────────┐     ┌──────────────┐
│ React Frontend│────▶│ Express.js API   │────▶│ PostgreSQL   │
│ (Dashboard)   │     │ (JWT + Services) │     │ (6 tables)   │
└───────────────┘     └──────────────────┘     └──────────────┘
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees (search, filter, paginate) |
| POST | `/api/employees` | Create new employee |
| GET | `/api/employees/:id` | Employee profile |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Soft delete |
| GET | `/api/departments/tree` | Department hierarchy |
| POST | `/api/attendance/check-in` | Clock in |
| POST | `/api/attendance/check-out` | Clock out |
| POST | `/api/leave` | Request leave |
| PUT | `/api/leave/:id/approve` | Approve leave |
| GET | `/api/reports/summary` | Dashboard analytics |

## 🗃️ Database Schema

| Table | Key Fields |
|-------|-----------|
| departments | name, code, parent_id (self-ref), budget |
| positions | title, min/max_salary, pay_grade |
| employees | employee_number (EMP-YYYY-NNN), department_id, position_id, salary, deleted_at |
| attendance_records | employee_id, date, check_in/out, total_hours, UNIQUE(emp,date) |
| leave_requests | leave_type, start/end_date, status, reviewed_by |
| leave_balances | employee_id, leave_type, total/used/remaining, year |

## 🚀 Getting Started

```bash
git clone https://github.com/KHALEDNOAMAN/Employee-Management-System.git
cd Employee-Management-System/backend
npm install && cp .env.example .env
npx knex migrate:latest && npx knex seed:run
npm run dev
```

## 📝 License
MIT License - see [LICENSE](LICENSE) file.

---
<div align="center">Built with ❤️ during internship at EduTech Yazilim A.S. - Istanbul, Turkey</div>
