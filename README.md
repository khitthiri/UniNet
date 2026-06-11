# UniNet — Student/Instructor Performance Tracking System

A full intranet-style web app for tracking assignments, exams, submissions, and grades.
Students see their work and grades; instructors assign tasks, grade, and leave feedback.

## Stack
- **Frontend:** React + Vite + Tailwind + daisyUI + Framer Motion + Recharts
- **Backend:** Node.js + Express + Mongoose (MongoDB) + JWT auth
- Deploys on **Vercel** (frontend) + **Render** (backend) + **MongoDB Atlas**

## What it covers (per the brief)
- Student information (academic year / level, student ID) — shown in sidebar + Profile
- A list of assigned tasks/assignments given by the instructor
- Due dates for each assignment
- Submission status: not submitted / submitted / late (auto-detected) / overdue
- Grading by the instructor (per student, out of max points)
- Notes from **both** the student and the instructor

## App structure (FinSight-style)
- **Onboarding:** Welcome screen → choose Student or Instructor → Login/Register
- **Persistent dark sidebar** with role-based nav, profile card, dark/light toggle, sign out
- **Student:** Overview (stats + charts + deadlines + feedback) · Assignments · Grades · Profile
- **Instructor:** Overview (stats + charts + needs-grading) · Assignments · Gradebook · Profile

## Run locally
1. `cd server && cp .env.example .env` — set `MONGO_URI` and `JWT_SECRET`
2. `cd server && npm install && npm run dev`  (port 5000)
3. `cd client && npm install && npm run dev`  (port 5173, proxies /api → 5000)

## Deploy
- **Backend (Render):** root `server/`, build `npm install`, start `npm start`; set env `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`
- **Frontend (Vercel):** root `client/`; set env `VITE_API_URL` to your Render URL (vercel.json handles SPA routing)
- **DB:** MongoDB Atlas free cluster; allow your IPs in Network Access

## Update — added features
- **Student/Instructor IDs:** every account gets a system-generated unique ID (e.g. `STU-7F3K9Q`, `INS-2M8XPL`) — this *is* their student/instructor ID, shown in the sidebar and on Profile. No separate manual ID field.
- **Login by email *or* ID:** the sign-in field accepts either, plus password.
- **Resource links on assignments:** instructors attach clickable links (briefs, readings, exam portals); students and instructors can open them.
- **File + link submissions:** students attach files (stored in MongoDB as base64, up to 4MB each — no external storage needed) and/or links, alongside the optional written answer. Grading shows and downloads them.
- **Two-way feedback:** students send feedback (with optional 1–5★ rating) to their instructors about teaching; instructors see all feedback received with an average rating and per-course breakdown. (Instructors already give per-submission feedback when grading.)
- **Instructor grade-rate analysis:** the Gradebook now shows class average, average grade per course (chart + breakdown), and per-assignment grading status.

> Note: file attachments are stored inside MongoDB (base64) to keep the app on the forever-free stack with zero extra config. For very large files at scale you'd swap in object storage (e.g. Cloudinary/S3), but this is ideal for a capstone demo.
