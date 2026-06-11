import { motion } from "framer-motion";

export function PageHeader({ title, subtitle, action }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="text-[28px] sm:text-[34px] font-bold leading-tight">{title}</h1>
        {subtitle && <p className="opacity-50 text-[15px] mt-1">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function Panel({ title, children, action, className = "" }) {
  return (
    <div className={`surface p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="font-bold text-[17px]">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
