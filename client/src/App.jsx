import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";

import Welcome from "./pages/Welcome.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

import StudentOverview from "./pages/student/Overview.jsx";
import StudentAssignments from "./pages/student/Assignments.jsx";
import StudentAssignmentDetail from "./pages/student/AssignmentDetail.jsx";
import StudentGrades from "./pages/student/Grades.jsx";
import StudentProfile from "./pages/student/Profile.jsx";
import StudentFeedback from "./pages/student/Feedback.jsx";

import InstructorOverview from "./pages/instructor/Overview.jsx";
import InstructorAssignments from "./pages/instructor/Assignments.jsx";
import InstructorAssignmentDetail from "./pages/instructor/AssignmentDetail.jsx";
import InstructorGradebook from "./pages/instructor/Gradebook.jsx";
import InstructorProfile from "./pages/instructor/Profile.jsx";
import InstructorFeedback from "./pages/instructor/Feedback.jsx";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center bg-base-200"><span className="loading loading-spinner loading-lg text-primary" /></div>;
  if (!user) return <Navigate to="/welcome" replace />;
  return <Navigate to={user.role === "instructor" ? "/instructor" : "/student"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student */}
      <Route element={<ProtectedRoute role="student"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/student" element={<StudentOverview />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/assignments/:id" element={<StudentAssignmentDetail />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/feedback" element={<StudentFeedback />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      {/* Instructor */}
      <Route element={<ProtectedRoute role="instructor"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/instructor" element={<InstructorOverview />} />
        <Route path="/instructor/assignments" element={<InstructorAssignments />} />
        <Route path="/instructor/assignments/:id" element={<InstructorAssignmentDetail />} />
        <Route path="/instructor/gradebook" element={<InstructorGradebook />} />
        <Route path="/instructor/feedback" element={<InstructorFeedback />} />
        <Route path="/instructor/profile" element={<InstructorProfile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
