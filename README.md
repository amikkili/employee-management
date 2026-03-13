Hi, I'm Anil Mikkili 👋

# WorkFlow HR — AI-Powered HR Management System

Full-stack HR Management System with an AI assistant that answers natural language questions about real employee data. 
Built with React, FastAPI, PostgreSQL, and LangChain — deployed on Render with CI/CD.
## Live Demo

- **App:** https://employee-management-1rvw.onrender.com
- **API Docs:** https://employee-api-f3hl.onrender.com/docs

## Demo Login:
Email:    admin@company.com
Password: admin123
```

>Hosted on Render free tier — first load takes ~30 seconds to wake up (cold start).

## Tech Stack

| Layer 	      |                   Tool                    |
|-----------------|-------------------------------------------|
| Frontend 	      | React 18, Recharts                        |
| Backend API     | FastAPI, Pydantic, Uvicorn                |
| Database        | PostgreSQL, asyncpg                       |
| AI Assistant    | LangChain, Groq (Llama 3.3 70B)           |
| Authentication  | JWT (python-jose), bcrypt (passlib)       |
| Deployment      | Render (Static + Web Service + PostgreSQL)|
| CI/CD           | GitHub → Render auto-deploy on push       |


## Features

### AI HR Assistant
- Ask natural language questions about your employees
- AI reads real-time PostgreSQL data as context
- Example queries:
  - *"Who earns the most in the company?"*
  - *"What is the average salary in Engineering?"*
  - *"List all active employees in Integration"*
- Powered by Groq (Llama 3.3 70B) via LangChain

### Analytics Dashboard
- Headcount per department (Bar chart)
- Staff status breakdown — Active / On Leave / Inactive (Pie chart)
- Average salary per department (Custom bar chart)
- Salary distribution by range
- Top 5 earners table

### JWT Authentication
- Login and registration
- bcrypt password hashing — no plain passwords stored
- All sensitive endpoints protected with `Depends(verify_token)`
- Token stored in localStorage, auto-expires after 60 minutes

## API Endpoints

GET    /                         Health check
GET    /api/employees            List all employees (filterable)
GET    /api/employees/{id}       Get single employee
POST   /api/employees            Create employee         🔒 JWT
PUT    /api/employees/{id}       Update employee         🔒 JWT
DELETE /api/employees/{id}       Delete employee         🔒 JWT
GET    /api/stats                Dashboard statistics    🔒 JWT
POST   /auth/login               Login → returns JWT token
POST   /auth/register            Register new user
GET    /auth/me                  Current user info       🔒 JWT
POST   /api/ai/chat              AI HR Assistant         🔒 JWT

## Project Structure

employee-ui/                     # React Frontend
└── src/
    ├── App.jsx                  # Dashboard, charts, employee table, auth logic
    ├── LoginPage.jsx            # Login and register forms
    └── AIChatPage.jsx           # AI assistant chat interface

### Run Locally - Frontend
```bash
git clone https://github.com/amikkili/employee-management.git
cd employee-ui
npm install

# Update API_BASE in App.jsx and AIChatPage.jsx:
# const API_BASE = "http://localhost:8000"

npm start
# App: http://localhost:3000

## Connect

- 🔗 LinkedIn: https://www.linkedin.com/in/anil-mikkili-97b97563/
- 💻 GitHub: https://github.com/amikkili/
- 📧 Email: anil.mikkili@gmail.com