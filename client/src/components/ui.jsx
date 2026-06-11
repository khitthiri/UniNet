import { motion, AnimatePresence } from "framer-motion";

// ---------- motion presets ----------
export const spring = { type: "spring", stiffness: 380, damping: 30 };

export const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { ...spring, staggerChildren: 0.05 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: spring },
};

export function Page({ children, className = "" }) {
  return (
    <motion.main variants={pageVariants} initial="initial" animate="animate" exit="exit"
      className={`max-w-4xl mx-auto px-4 sm:px-6 py-7 sm:py-10 ${className}`}>
      {children}
    </motion.main>
  );
}

// ---------- primitives ----------
export function Card({ children, className = "", as = "div", ...props }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag variants={itemVariants}
      className={`bg-white rounded-2xl shadow-card border border-black/5 ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-accent text-white hover:bg-accent-hover disabled:bg-accent/40",
    soft: "bg-accent/10 text-accent-deep hover:bg-accent/15",
    ghost: "text-accent-deep hover:bg-black/5",
    danger: "text-bad hover:bg-bad/10",
  };
  return (
    <motion.button whileTap={{ scale: 0.97 }} transition={spring}
      className={`rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}>
      {children}
    </motion.button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-sub mb-1.5">
        {label} {hint && <span className="font-normal opacity-70">({hint})</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full bg-canvas border border-hairline rounded-xl px-4 py-2.5 text-[15px] placeholder:text-sub/60 " +
  "focus:border-accent focus:bg-white transition-colors";

export function Input(props) { return <input className={inputCls} {...props} />; }
export function Textarea({ className = "", ...props }) { return <textarea className={`${inputCls} min-h-24 ${className}`} {...props} />; }
export function Select({ children, ...props }) {
  return <select className={`${inputCls} appearance-none pr-9 bg-no-repeat bg-[right_0.9rem_center] bg-[length:12px] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 12 8%22><path d=%22M1 1.5 6 6.5 11 1.5%22 fill=%22none%22 stroke=%22%236e6e73%22 stroke-width=%222%22 stroke-linecap=%22round%22/></svg>')]`} {...props}>{children}</select>;
}

export function Spinner({ className = "" }) {
  return (
    <span className={`inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin align-middle ${className}`} />
  );
}

export function Alert({ type = "error", children }) {
  const styles = {
    error: "bg-bad/10 text-bad",
    success: "bg-good/10 text-[#1d8a3c]",
    info: "bg-accent/10 text-accent-deep",
  };
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={spring}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium ${styles[type]}`}>
      {children}
    </motion.div>
  );
}

export function Modal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={spring}
            className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-modal p-6 max-h-[88vh] overflow-y-auto">
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CenterSpinner() {
  return (
    <div className="grid place-items-center py-28">
      <Spinner className="text-accent w-7 h-7" />
    </div>
  );
}

export function Empty({ title, body }) {
  return (
    <Card className="py-12 px-6 text-center">
      <p className="font-semibold text-[17px]">{title}</p>
      <p className="text-sub text-sm mt-1 max-w-sm mx-auto">{body}</p>
    </Card>
  );
}

// Segmented control, iOS-style, with a sliding pill
export function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-black/5 rounded-full p-1 gap-0.5">
      {options.map((o) => (
        <button key={o.key} onClick={() => onChange(o.key)}
          className="relative px-4 py-1.5 text-[13px] font-medium rounded-full text-ink/80">
          {value === o.key && (
            <motion.span layoutId="seg-pill" transition={spring}
              className="absolute inset-0 bg-white rounded-full shadow-card" />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
