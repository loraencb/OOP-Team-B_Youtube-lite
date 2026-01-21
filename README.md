# OOP-Team-B_Youtube-lite
A lightweight YouTube-style application built as an OOP team project.

## System Architecture
```mermaid
flowchart TB

  subgraph C[Clients]
    V[Viewer Browser]
    CR[Creator Browser]
    A[Admin Browser]
  end

  subgraph W[Web Layer]
    R[Web Router and Reverse Proxy]
    UI[Web User Interface]
  end

  subgraph B[Backend Application]
    AUTH[Authentication and RBAC]
    VIDEO[Video Management]
    SOCIAL[Social Features]
    ADMIN[Admin Moderation]
    SEARCH[Search Service]
    SVC[Service Layer]
    DAO[Data Access Layer]
  end

  subgraph D[Data Layer]
    DB[(Relational Database)]
    FS[(Video File Storage)]
    TH[(Thumbnail Storage)]
  end

  subgraph O[Operations]
    LOG[Application Logs]
    MET[System Metrics]
  end

  V --> R
  CR --> R
  A --> R

  R --> UI
  R --> B

  UI --> B

  B --> AUTH
  B --> VIDEO
  B --> SOCIAL
  B --> ADMIN
  B --> SEARCH

  AUTH --> SVC
  VIDEO --> SVC
  SOCIAL --> SVC
  ADMIN --> SVC
  SEARCH --> SVC

  SVC --> DAO
  DAO --> DB

  VIDEO --> FS
  VIDEO --> TH

  B --> LOG
  R --> LOG
  LOG --> MET
```
## Recomended File Structure
```text
youtube-lite/
├── README.md              # Project overview and setup instructions
├── .gitignore             # Git ignored files
├── .env.example           # Environment variable template
├── requirements.txt       # Python dependencies
│
├── src/
│   └── app/
│       ├── __init__.py   
│       ├── config.py      # Application configuration
│       ├── extensions.py  # Flask extensions (DB, auth, etc.)
│       │
│       ├── models/        # Database entities (DB Lead)
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── video.py
│       │   ├── comment.py
│       │   ├── like.py
│       │   ├── subscription.py
│       │   └── report.py
│       │
│       ├── services/      # Business logic layer
│       │   ├── __init__.py
│       │   ├── auth/
│       │   │   └── service.py
│       │   ├── video/
│       │   │   └── service.py
│       │   ├── social/
│       │   │   └── service.py
│       │   └── admin/
│       │       └── service.py
│       │
│       ├── routes/        # Controllers / web endpoints
│       │   ├── __init__.py
│       │   ├── auth/
│       │   │   └── routes.py
│       │   ├── video/
│       │   │   └── routes.py
│       │   ├── social/
│       │   │   └── routes.py
│       │   └── admin/
│       │       └── routes.py
│       │
│       ├── templates/     # HTML templates (UI Lead)
│       │   ├── base.html
│       │   ├── auth/
│       │   ├── video/
│       │   ├── admin/
│       │   └── dashboard/
│       │
│       ├── static/        # CSS, JavaScript, images
│       │   ├── css/
│       │   │   └── style.css
│       │   ├── js/
│       │   └── images/
│       │
│       └── utils/         # Helper utilities
│           ├── __init__.py
│           ├── rbac.py
│           └── decorators.py
│
├── tests/                 # QA / Testing
│   ├── test_auth.py
│   ├── test_video.py
│   ├── test_social.py
│   └── test_admin.py
│
├── scripts/               # Utility scripts
│   ├── seed_db.py
│   └── create_admin.py
│
└── run.py                 # Application entry point

```
