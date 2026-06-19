export const spring = { type: "spring", stiffness: 380, damping: 30 };
export const springSoft = { type: "spring", stiffness: 260, damping: 26 };

export const page = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1, y: 0,
    transition: { ...springSoft, staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

export const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: springSoft },
};

export const lift = {
  whileHover: { y: -3, scale: 1.005, boxShadow: "0 2px 4px rgba(0,0,0,0.05), 0 16px 40px rgba(0,0,0,0.10)" },
  whileTap: { scale: 0.985 },
};

export const modalBackdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalCard = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  show: { opacity: 1, scale: 1, y: 0, transition: spring },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.15 } },
};
