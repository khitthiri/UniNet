# UniNet

UniNet is a performance tracking system for students and instructors. Instructors post assignments and exams, set due dates, and grade what students hand in. Students see their work, submit answers (as text, files, or links), and keep track of their grades. I built this as a full-stack project for school, and the goal was for it to feel like a small intranet you'd actually log into for a class rather than just a demo.

It works on both desktop and mobile.

## What you can do

**As a student**
- See every assignment and exam assigned to your year, with the due date and where you stand (not submitted, submitted, late, or overdue)
- Turn in a written answer, attach files, or paste links to your work
- Track your grades, your overall average, and a breakdown by course
- Send feedback to your instructors about how they teach

**As an instructor**
- Create assignments and exams, set the due date, points, and which year they go to
- Attach resource links students can click through to (readings, briefs, an exam portal, etc.)
- Grade submissions, leave notes, and open the files students attached
- Use the gradebook to see class averages per course and who still needs grading
- Read the feedback students leave about your teaching

Everyone gets a unique ID when they sign up, which doubles as the student/instructor ID, and you can log in with either your email or that ID.

## Tech stack

Frontend is React with Vite, Tailwind and daisyUI for styling, Framer Motion for the animations, and Recharts for the charts. Backend is Node and Express with MongoDB (Mongoose), and auth is handled with JWT.

For deployment I went with the same setup I'd used before on FinSight: frontend on Vercel, backend on Render, database on MongoDB Atlas.

## Running it locally

You'll need Node installed and a MongoDB connection (either a local mongod or a free Atlas cluster).

Backend:
```bash
cd server
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm install
npm run dev              # http://localhost:5000
```

Frontend, in a second terminal:
```bash
cd client
npm install
npm run dev              # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so there's nothing else to wire up for local dev.

## Environment variables

`server/.env`:
```
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=any-long-random-string
CLIENT_ORIGIN=http://localhost:5173
```

In production, set `VITE_API_URL` on the frontend to your deployed backend URL.

## Deploying

- **Database:** make a free MongoDB Atlas cluster, copy the connection string, and allow your IPs under Network Access.
- **Backend (Render):** root directory `server`, build command `npm install`, start command `npm start`. Add `MONGO_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` as env vars.
- **Frontend (Vercel):** root directory `client`. Set `VITE_API_URL` to the Render URL. The included `vercel.json` handles the SPA routing.

## A note on file uploads

Files students submit are stored in MongoDB as base64, capped at about 4MB each. I did it this way so the whole app runs on free tiers without needing a separate storage service. If it ever had to deal with a lot of big files I'd move uploads over to something like Cloudinary or S3, but for the size of this project keeping it self-contained made more sense.

## Stuff I might add later

- Editing assignments after posting (right now you can create and delete, not edit)
- Reminders/notifications when something is due soon or just got graded
- Filtering the gradebook by course