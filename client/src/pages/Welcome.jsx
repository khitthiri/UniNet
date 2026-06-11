import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { IcCap, IcUser, IcBook, IcArrow } from "../components/Icons.jsx";

const ROLES = [
  { role: "student", title: "I'm a Student", desc: "See your assignments, due dates, submit work, and track your grades.", Icon: IcBook },
  { role: "instructor", title: "I'm an Instructor", desc: "Assign tasks and exams, set due dates, grade submissions, and leave feedback.", Icon: IcUser },
];

export default function Welcome() {
  const navigate = useNavigate();
  const choose = (role) => navigate("/login", { state: { role } });

  return (
    <div className="min-h-screen bg-base-200 grid place-items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="flex flex-col items-center text-center mb-9">
          <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center shadow-lift mb-4">
            <IcCap width={30} height={30} stroke="#fff" />
          </div>
          <h1 className="text-[34px] sm:text-[40px] font-bold leading-tight">Welcome to UniNet</h1>
          <p className="opacity-50 text-[16px] mt-2 max-w-md">
            The performance tracking system for assignments, exams, and grades. To get started, tell us who you are.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ROLES.map(({ role, title, desc, Icon }, i) => (
            <motion.button key={role}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.08 + i * 0.07 }}
              whileHover={{ y: -4 }} whileTap={{ scale: 0.985 }}
              onClick={() => choose(role)}
              className="surface p-6 text-left group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 grid place-items-center mb-4">
                <Icon width={24} height={24} className="text-primary" />
              </div>
              <h2 className="font-bold text-[19px]">{title}</h2>
              <p className="text-[14px] opacity-55 mt-1.5 leading-relaxed">{desc}</p>
              <span className="inline-flex items-center gap-1.5 text-primary font-semibold text-[14px] mt-4">
                Continue <IcArrow width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
