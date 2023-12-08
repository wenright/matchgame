import { motion } from 'framer-motion';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{
        type: "easeInOut",
        duration: 0.3,
      }}
    >
      {children}
    </motion.div>
  );
}

export default Layout;
