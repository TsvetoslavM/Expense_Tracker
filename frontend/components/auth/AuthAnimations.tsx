import { Variants } from 'framer-motion'

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 }
}

export const scaleIn: Variants = {
  initial: { scale: 0.95 },
  animate: { scale: 1 }
}

export const successCheckmark: Variants = {
  initial: { scale: 0 },
  animate: { 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      delay: 0.2
    }
  }
}

// Helper function to generate blob animations
const createBlobAnimation = (position: 'topRight' | 'bottomLeft' | 'center', color: string, duration: number = 20) => {
  const baseClassName = `absolute w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20`;
  let className = `${baseClassName} bg-${color}-400`;
  let animate = {};
  let transition = {
    duration: duration,
    repeat: Infinity,
    ease: "linear" as const
  };

  if (position === 'topRight') {
    className = `absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 bg-${color}-400`;
    animate = {
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0],
    };
  } else if (position === 'bottomLeft') {
    className = `absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 bg-${color}-400`;
    animate = {
      scale: [1.2, 1, 1.2],
      rotate: [90, 0, 90],
    };
  } else if (position === 'center') {
     className = `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl opacity-10 bg-${color}-400`;
    animate = {
      scale: [1, 1.1, 1],
      rotate: [45, 90, 45],
    };
    transition.duration = duration; // Use provided duration for center
  }

  return { className, animate, transition };
};

// Login page animations
export const loginBlobAnimations = {
  topRight: createBlobAnimation('topRight', 'blue'),
  bottomLeft: createBlobAnimation('bottomLeft', 'purple'),
}

// Register page animations
export const registerBlobAnimations = {
  topRight: createBlobAnimation('topRight', 'purple'),
  bottomLeft: createBlobAnimation('bottomLeft', 'blue'),
  center: createBlobAnimation('center', 'indigo', 15),
}

// Password reset animations (for forgot-password and reset-password)
export const passwordResetBlobAnimations = {
  topRight: createBlobAnimation('topRight', 'emerald'),
  bottomLeft: createBlobAnimation('bottomLeft', 'cyan'),
  center: createBlobAnimation('center', 'teal', 15),
} 