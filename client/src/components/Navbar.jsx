import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="glass sticky top-0 z-30 border-b border-black/5"
    >
      <div className="max-w-4xl mx-auto flex items-center h-14 px-4 sm:px-6">
        <Link to="/" className="font-bold text-[17px] tracking-tight flex-1">
          Uni<span className="text-primary">Net</span>
        </Link>
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right leading-tight">
              <p className="text-[13px] font-semibold">{user.name}</p>
              <p className="text-[11px] opacity-50 capitalize">
                {user.role}{user.role === "student" && user.academicYear ? ` · ${user.academicYear}` : ""}
              </p>
            </div>
            <div className="dropdown dropdown-end">
              <motion.label tabIndex={0} whileTap={{ scale: 0.92 }}
                className="btn btn-circle btn-ghost btn-sm avatar placeholder cursor-pointer">
                <div className="bg-gradient-to-b from-[#3694f1] to-primary text-primary-content rounded-full w-8">
                  <span className="text-xs font-semibold">
                    {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                </div>
              </motion.label>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-2xl shadow-lift w-52 mt-3 p-2 z-40">
                <li className="menu-title sm:hidden">
                  {user.name} · <span className="capitalize">{user.role}</span>
                </li>
                <li><button onClick={handleLogout}>Sign out</button></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
