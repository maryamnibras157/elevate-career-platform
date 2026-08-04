# ELEVATE

## AI-Powered Career Recommendation & Learning Platform

ELEVATE is a full-stack AI-powered web application designed to help students and aspiring professionals make informed career decisions. By combining intelligent career recommendations, AI-powered resume analysis, skill gap detection, and personalized learning roadmaps, the platform provides a comprehensive career guidance experience tailored to each user.

---

## Live Application

**URL:** https://elevate-frontend-qdnz.onrender.com/

---

## Technology Stack

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=next.js\&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge\&logo=react\&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge\&logo=nestjs\&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge\&logo=nodedotjs\&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge\&logo=postgresql\&logoColor=white)

![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge\&logo=prisma\&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge\&logo=tailwindcss\&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-111111?style=for-the-badge)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge\&logo=openai\&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge\&logo=jsonwebtokens\&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge\&logo=render\&logoColor=black)

---

## Project Highlights

* AI-powered career recommendation engine
* Intelligent resume analysis and skill extraction
* Personalized learning roadmaps
* Skill gap identification
* Secure authentication and role-based access
* Interactive user dashboard
* Administrative management portal
* Learning resource recommendations
* Career progress tracking
* Responsive and modern user interface

---

## Key Modules

### User Module

* Authentication and authorization
* Personalized dashboard
* Career recommendation
* Resume analysis
* Learning roadmap
* Skill gap analysis
* Saved careers
* Learning resources
* Profile management

### Administrator Module

* Dashboard analytics
* User management
* Career management
* Skill management
* Roadmap management
* Learning resource management
* Resume monitoring
* Platform insights

---

## AI Features

### Career Recommendation

Generates personalized career suggestions by analyzing user skills, interests, academic background, and career preferences.

### Resume Analyzer

Extracts skills from uploaded resumes, evaluates resume quality, identifies missing competencies, and matches resumes with suitable career paths.

### Personalized Learning Roadmaps

Creates structured learning paths that guide users through the skills and resources required to achieve their target career.

---

## System Architecture

```text
                                      Users
                                        │
                                        ▼
                     ┌─────────────────────────────────┐
                     │        Next.js Frontend         │
                     │ React • TypeScript • Tailwind   │
                     └───────────────┬─────────────────┘
                                     │
                              REST API (JWT)
                                     │
                                     ▼
                     ┌─────────────────────────────────┐
                     │         NestJS Backend          │
                     │ Authentication • Business Logic │
                     │ AI Integration • REST Services  │
                     └──────────┬───────────┬──────────┘
                                │           │
                         Prisma ORM         │
                                │           │
                                ▼           ▼
                     ┌────────────────┐  ┌────────────────┐
                     │ PostgreSQL DB  │  │   OpenAI API   │
                     └────────────────┘  └────────────────┘
```

---

## Project Structure

```text
ELEVATE
│
├── frontend
│   ├── app
│   ├── components
│   ├── contexts
│   ├── hooks
│   ├── services
│   ├── lib
│   └── public
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── auth
│   │   ├── users
│   │   ├── careers
│   │   ├── recommendations
│   │   ├── roadmap
│   │   ├── resume
│   │   ├── admin
│   │   └── common
│   └── uploads
│
└── README.md
```

---

## Built With

| Category       | Technologies                                        |
| -------------- | --------------------------------------------------- |
| Frontend       | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend        | NestJS, Node.js, TypeScript                         |
| Database       | PostgreSQL, Prisma ORM                              |
| Authentication | JWT, Passport.js                                    |
| AI Integration | OpenAI API                                          |
| Deployment     | Render                                              |

---

## Future Enhancements

* AI mock interview assistant
* Internship recommendation system
* Company recommendation engine
* Mobile application
* Multi-language support
* Advanced analytics and reporting

---

**Developed By**

* Maryam Nibras

---

## License

This project was developed for academic and educational purposes.

---

<div align="center">

## ELEVATE

### AI-Powered Career Recommendation & Learning Platform

Helping learners discover the right career path through intelligent recommendations, resume analysis, and personalized learning experiences.

**Live Application:** https://elevate-frontend-qdnz.onrender.com/

</div>


