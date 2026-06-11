import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar.jsx";
import { IcMenu, IcClose, IcCap } from "./Icons.jsx";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-base-200">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden glass sticky top-0 z-30 flex items-center h-14 px-4 border-b border-black/5">
        <button onClick={() => setOpen(true)} className="btn btn-ghost btn-sm btn-circle">
          <IcMenu width={22} height={22} />
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#3694f1] to-[#0a84ff] grid place-items-center">
            <IcCap width={14} height={14} stroke="#fff" />
          </div>
          <span className="font-extrabold text-[16px] tracking-tight">UniNet</span>
        </div>
        <div className="w-8" />
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/40" style={{ backdropFilter: "blur(3px)" }} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50">
              <div className="relative h-full">
                <button onClick={() => setOpen(false)}
                  className="absolute top-4 right-3 z-10 text-white/60 hover:text-white">
                  <IcClose width={22} height={22} />
                </button>
                <Sidebar onNavigate={() => setOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="lg:pl-[260px]">
        <div className="min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
