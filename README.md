# UniCore: Smart Institutional ERP & Student Risk Analytics

UniCore is a modern institutional Enterprise Resource Planning (ERP) platform designed for higher education and academic institutions. It bridges daily academic administration (admissions, attendance, grading, faculty workflows) with predictive machine learning to enable early identification of at-risk students and proactive academic intervention.

---

## 📌 Project Status

- **ML Core Engine**: ✅ **Completed** (Pre-trained Random Forest models & datasets validated and locked)
- **Architecture & Rules**: ✅ **Established**
- **Backend & API**: ⏳ *Pending Implementation*
- **Database & Schema**: ⏳ *Pending Implementation*
- **Frontend & Dashboards**: ⏳ *Pending Implementation*
- **AI Advisor / Copilot**: ⏳ *Pending Implementation*

---

## 🏛️ System Overview

UniCore is designed with modularity, scalability, and clean boundary separation:

```
UniCore Platform
├── Frontend Layer (React / Vite Single Page Application)
│   ├── Admin Portal
│   ├── Faculty Portal
│   ├── Student Portal
│   └── Early Warning & Risk Analytics Dashboard
│
├── Backend Layer (FastAPI / Python Async REST API)
│   ├── ERP Core Services (Users, Roles, Courses, Attendance, Grading)
│   ├── ML Inference Service (Predictive Scoring Bridge)
│   └── Analytics & Reporting
│
├── Database Layer (PostgreSQL / SQLite)
│   ├── Relational Schemas (Normalized Academic Records)
│   └── Migrations & Seed Data
│
└── ML Intelligence Core (ML/) [COMPLETED & FROZEN]
    ├── Standard Risk Predictor (Full Term Features)
    └── Early Warning Predictor (Mid-Semester Intervention)
```

---

## 🤖 Machine Learning Intelligence (`ML/`)

The machine learning component predicts student academic risk levels (`High Risk`, `Medium Risk`, `Low Risk`) using institutional performance metrics.

### Models Overview
| Model Artifact | Description | Features Used | Target Accuracy |
| :--- | :--- | :--- | :--- |
| [`ML/models/random_forest_model.pkl`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/models/random_forest_model.pkl) | Full-cycle risk classifier | Attendance, Midterm, Final, Assignments Avg, Quizzes Avg, Participation, Projects | ~98-99% |
| [`ML/models/early_random_forest_model.pkl`](file:///c:/Users/SANJAI%20KARTHIKEYAN%20S/Desktop/UniCore/ML/models/early_random_forest_model.pkl) | Early-alert classifier (pre-final exam) | Attendance, Midterm, Assignments Avg, Quizzes Avg, Participation, Projects | Early intervention |

### Risk Classification Thresholds
- **High Risk**: Risk Score $< 65$
- **Medium Risk**: $65 \le$ Risk Score $< 75$
- **Low Risk**: Risk Score $\ge 75$

> **Important**: The existing `ML/` directory contains finished and validated machine learning models and training scripts. These files are strictly read-only and preserved without modification.

---

## 🚀 Running the Existing ML Predictor

To test predictions using the completed ML model:

```bash
# Navigate to ML directory
cd ML

# Run the interactive predictor
python predict.py
```

---

## 📋 Proposed Roadmap

1. **Architecture & Foundation**: Project documentation, agent constraints, directory blueprints. *(Current)*
2. **Backend & Database Service**: FastAPI framework setup, SQLAlchemy models, migration workflows, read-only ML model inference endpoints.
3. **Frontend Application**: Vite + React frontend with a modern glassmorphic, responsive design system.
4. **Institutional Modules**: Attendance tracking, assessment entry, automated risk alerts, and role-based views.
5. **AI Academic Advisor**: Intelligent recommendation engine utilizing risk probabilities.

---

## 📄 Documentation

- [System Architecture](ARCHITECTURE.md)
- [Current Project State & Artifact Log](UNICORE_PROJECT_STATE.md)
- [Agent & Engineering Rules](AGENTS.md)
