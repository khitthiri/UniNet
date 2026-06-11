import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { IcGrid, IcTasks, IcChart, IcUser, IcLogout, IcSun, IcMoon, IcCap, IcMessage } from "./Icons.jsx";

const STUDENT_NAV = [
  { to: "/student", label: "Overview", Icon: IcGrid, end: true },
  { to: "/student/assignments", label: "Assignments", Icon: IcTasks },
  { to: "/student/grades", label: "Grades", Icon: IcChart },
  { to: "/student/feedback", label: "Feedback", Icon: IcMessage },
  { to: "/student/profile", label: "Profile", Icon: IcUser },
];
const INSTRUCTOR_NAV = [
  { to: "/instructor", label: "Overview", Icon: IcGrid, end: true },
  { to: "/instructor/assignments", label: "Assignments", Icon: IcTasks },
  { to: "/instructor/gradebook", label: "Gradebook", Icon: IcChart },
  { to: "/instructor/feedback", label: "Feedback", Icon: IcMessage },
  { to: "/instructor/profile", label: "Profile", Icon: IcUser },
];

export default function Sidebar({ onNavigate }) {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const nav = user?.role === "instructor" ? INSTRUCTOR_NAV : STUDENT_NAV;

  const signOut = () => { logout(); navigate("/welcome"); };
  const initials = user?.name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="sidebar-shell h-full w-[260px] flex flex-col px-4 py-5">
      <div className="flex items-center gap-2.5 px-2 mb-7">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center shadow-lg">
          <IcCap width={18} height={18} stroke="#fff" />
        </div>
        <span className="font-extrabold text-[19px] text-white tracking-tight">UniNet</span>
      </div>

      <nav className="flex flex-col gap-1.5">
        {nav.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon className="nav-ico" width={19} height={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 space-y-2">
        <button onClick={toggle} className="nav-link w-full">
          {isDark ? <IcSun className="nav-ico" width={19} height={19} /> : <IcMoon className="nav-ico" width={19} height={19} />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        <div className="rounded-2xl bg-white/[0.05] px-3 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-b from-[#3694f1] to-[#0a84ff] grid place-items-center shrink-0">
            <span className="text-[13px] font-bold text-white">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[11px] text-white/45 capitalize truncate">
              {user?.role}{user?.role === "student" && user?.academicYear ? ` · ${user.academicYear}` : ""}
            </p>
            {user?.uid && <p className="text-[10px] font-mono text-white/35 truncate mt-0.5">{user.uid}</p>}
          </div>
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={signOut}
          className="nav-link w-full text-[#ff6b6b] hover:!bg-[#ff453a]/12 hover:!text-[#ff6b6b]">
          <IcLogout width={19} height={19} />
          <span>Sign out</span>
        </motion.button>
      </div>
    </div>
  );
}
