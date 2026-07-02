# HRsATHI – AI-Powered Resume Screening & Intelligent Candidate Ranking

<p align="center">
  <img src="docs/logo.png" width="180"/>
</p>

<p align="center">
<b>Hire Smarter • Faster • Fairer</b>

AI-powered Applicant Tracking System (ATS) that automatically analyzes Job Descriptions, ranks candidates using AI, and helps recruiters identify the best talent within seconds.
</p>

---

# Problem Statement

Recruiters today receive hundreds or even thousands of resumes for a single opening.

Current hiring challenges include:

- Manual resume screening
- Time-consuming candidate shortlisting
- Keyword-based ATS missing good candidates
- Recruiter bias
- Lack of explainable candidate ranking

For large organizations, reviewing resumes manually can consume several hours for a single role.

---

# 💡 Solution

HRsATHI is an AI-powered recruitment platform that automates candidate screening.

Instead of recruiters reviewing thousands of resumes manually, HRsATHI:

- Parses the Job Description
- Extracts required skills and experience
- Compares candidates using AI
- Generates candidate scores
- Produces explainable rankings
- Shortlists the best candidates

---

# ✨ Features

## HR Dashboard

<img width="1440" height="898" alt="Screenshot 2026-07-02 at 12 54 43 PM" src="https://github.com/user-attachments/assets/fb108f18-7aba-4159-b129-cc7e63e09fa0" />


- Secure HR Authentication
- Create Job Openings
- Job Management Dashboard
- Public Job Links
- Candidate Tracking

---

## Candidate Portal

<img width="1312" height="755" alt="Screenshot 2026-07-02 at 12 55 10 PM" src="https://github.com/user-attachments/assets/55ce96e9-0767-4858-a866-2c996094c954" />


---

## AI Features

- Resume Parsing
- Intelligent Candidate Ranking
- Skill Matching
- Experience Analysis
- Education Matching
- Explainable AI Ranking
- AI-generated Candidate Summary
- Candidate Shortlisting

---



```
Recruiter
      │
      ▼
Create Job
      │
      ▼
Job Description
      │
      ▼
Groq LLM
Extract Skills
Experience
Education
Requirements
      │
      ▼
Voyage AI Embeddings
      │
      ▼
100,000 Candidate Dataset
      │
      ▼
AI Ranking Engine
      │
      ▼
Top 100 Candidates
      │
      ▼
Recruiter Dashboard
```

---

# 🏗 Architecture

```
                        HR Dashboard
                             │
                             ▼
                   Create Job Description
                             │
                             ▼
                    Supabase PostgreSQL
                             │
                             ▼
                  AI Ranking Engine
             ┌──────────────────────────┐
             │                          │
             ▼                          ▼
      Groq LLM                  Voyage AI
 JD Understanding             Semantic Search
             │                          │
             └────────────┬─────────────┘
                          ▼
                Candidate Ranking
                          ▼
              Top Candidates Stored
                          ▼
               Recruiter Dashboard
```

---

# 🛠 Tech Stack

## Frontend

- Next.js
- TypeScript
- TailwindCSS

---

## Backend

- Next.js API Routes
- Supabase

---

## Database

- PostgreSQL
- Supabase Storage

---

## Authentication

- Clerk Authentication

---

## AI Stack

### Groq

- Job Description Parsing
- AI Reasoning
- Candidate Summary

### Voyage AI

- Embeddings
- Semantic Similarity
- Candidate Ranking

---

# 📂 Project Structure

```
HRSATHI/

app/
components/
lib/
    ai/
    ranking/
    supabase/

public/

data/
    candidates.jsonl

types/

docs/

README.md
```

---

# ⚙️ Installation

Clone Repository

```bash
git clone https://github.com/Aravyaduvanshi/HRSATHI.git
```

Go inside

```bash
cd HRSATHI
```

Install dependencies

```bash
npm install
```

Create

```
.env.local
```

Add

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

GROQ_API_KEY=

VOYAGE_API_KEY=
```

Run

```bash
npm run dev
```

---

# AI Candidate Scoring

Candidates are ranked using a hybrid scoring system.

| Criteria | Weight |
|-----------|--------|
| Skills Match | 40% |
| Experience | 25% |
| Education | 10% |
| Recruiter Signals | 25% |

Future versions include semantic embeddings for more accurate ranking.

---

# 📈 Results

Current MVP processes

- 100,000 Candidates
- Generates Top 100 Candidates
- AI-powered candidate ranking
- Recruiter Dashboard
- Resume Upload System

---

# 🚀 Future Roadmap

- AI Interview Question Generator
- Candidate Skill Gap Analysis
- Resume Feedback
- AI Hiring Assistant
- LinkedIn Integration
- ATS Analytics Dashboard
- Bias Detection
- Multi-language Resume Support

---


# 👨‍💻 Team

Developed during the Hackathon.

Team Members

- Arav Kumar Yadav
- Piyush raj
- anik gharami
- aniket singh

---

# 🙏 Acknowledgements

- Supabase
- Clerk
- Groq
- Voyage AI
- Next.js
- TailwindCSS

---


<p align="center">

Built with ❤️ using AI to transform recruitment.

</p>
