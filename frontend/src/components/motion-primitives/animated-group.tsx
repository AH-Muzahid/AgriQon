"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
}

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  className = "",
  variants = {},
}) => {
  const defaultContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const defaultItemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      },
    },
  };

  const containerVariants = variants.container || defaultContainerVariants;
  const itemVariants = variants.item || defaultItemVariants;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return null;
        return (
          <motion.div key={idx} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
};
export default AnimatedGroup;
