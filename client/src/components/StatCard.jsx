import { motion } from "framer-motion";

export default function StatCard({ label, value, sub, tone = "", Icon, iconBg = "bg-primary/10", iconColor = "text-primary", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay }}
      whileHover={{ y: -3 }}
      className="surface p-5">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl grid place-items-center ${iconBg}`}>
            <Icon width={20} height={20} className={iconColor} />
          </div>
        )}
      </div>
      <p className={`text-[30px] font-bold leading-tight mt-3 ${tone}`}>{value}</p>
      <p className="text-[13px] font-medium opacity-50 mt-0.5">{label}</p>
      {sub && <p className="text-[12px] opacity-40 mt-0.5">{sub}</p>}
    </motion.div>
  );
}
