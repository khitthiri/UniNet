import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext.jsx";
import { PageHeader, Panel } from "../../components/Page.jsx";
import { IcCap } from "../../components/Icons.jsx";

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-base-content/[0.06] last:border-0">
      <span className="text-[13px] opacity-50">{label}</span>
      <span className="text-[14px] font-semibold">{value || "—"}</span>
    </div>
  );
}

export default function StudentProfile() {
  const { user } = useAuth();
  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="px-4 sm:px-8 py-7 max-w-3xl mx-auto">
      <PageHeader title="Profile" subtitle="Your student information" />
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="surface p-6 sm:p-7">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center shadow-lg">
            <span className="text-[22px] font-bold text-white">{initials}</span>
          </div>
          <div>
            <h2 className="text-[22px] font-bold">{user.name}</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold bg-primary/10 text-primary mt-1">
              <IcCap width={13} height={13} /> {user.academicYear} Student
            </span>
          </div>
        </div>
        <div className="mt-6">
          <Row label="Full name" value={user.name} />
          <Row label="Email" value={user.email} />
          <Row label="Role" value="Student" />
          <Row label="Academic year / level" value={user.academicYear} />
          <Row label="Student ID" value={user.uid} />
        </div>
      </motion.div>
    </div>
  );
}
