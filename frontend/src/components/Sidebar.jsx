import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  CheckCircle2, 
  Target, 
  BookOpen, 
  FolderGit2, 
  BookText, 
  Menu, 
  X,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Daily Planner', path: '/planner', icon: ListTodo },
    { name: 'Habit Tracker', path: '/habits', icon: CheckCircle2 },
    { name: 'Goals', path: '/goals', icon: Target },
    { name: 'English Hub', path: '/english', icon: BookOpen },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Journal', path: '/journal', icon: BookText },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0b0c10]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Compass className="text-[#3b82f6] animate-pulse" size={24} />
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            135-Day Transformation
          </span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-300 hover:text-white transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        initial="closed"
        className={`fixed top-0 left-0 bottom-0 w-64 glass z-50 md:sticky md:translate-x-0 flex flex-col justify-between`}
      >
        <div className="p-6">
          {/* Logo / Header */}
          <div className="hidden md:flex items-center gap-3 mb-8">
            <Compass className="text-[#3b82f6] animate-pulse" size={28} />
            <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent m-0">
              135-DAY SYS
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}
                `}
              >
                <item.icon className="group-hover:scale-110 transition-transform duration-300" size={20} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info / Status Footer */}
        <div className="p-6 border-t border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-sm">
              SE
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Student Engineer</p>
              <p className="text-xs text-gray-400">135-Day Transformation</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
