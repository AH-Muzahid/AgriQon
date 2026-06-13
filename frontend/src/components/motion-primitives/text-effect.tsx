"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface TextEffectProps {
  children: string;
  per?: "char" | "word" | "line";
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  preset?: "fade" | "fade-in-blur";
  delay?: number;
  speedSegment?: number;
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  per = "word",
  as: Component = "span",
  className = "",
  preset = "fade-in-blur",
  delay = 0,
}) => {
  const words = children.split(" ");

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 8,
      filter: preset === "fade-in-blur" ? "blur(8px)" : "none",
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 18,
        stiffness: 120,
      },
    },
  };

  const MotionComponent = motion(Component as any);

  return (
    <MotionComponent
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          variants={itemVariants}
          className="inline-block mr-[0.25em] last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </MotionComponent>
  );
};
export default TextEffect;
