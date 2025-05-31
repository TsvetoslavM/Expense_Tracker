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

// Login page animations
export const loginBlobAnimations = {
  topRight: {
    className: "absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20",
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  },
  bottomLeft: {
    className: "absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20",
    animate: {
      scale: [1.2, 1, 1.2],
      rotate: [90, 0, 90],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Register page animations
export const registerBlobAnimations = {
  topRight: {
    className: "absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20",
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  },
  bottomLeft: {
    className: "absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20",
    animate: {
      scale: [1.2, 1, 1.2],
      rotate: [90, 0, 90],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  },
  center: {
    className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-10",
    animate: {
      scale: [1, 1.1, 1],
      rotate: [45, 90, 45],
    },
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }
  }
}

// Password reset animations (for forgot-password and reset-password)
export const passwordResetBlobAnimations = {
  topRight: {
    className: "absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20",
    animate: {
      scale: [1, 1.2, 1],
      rotate: [0, 90, 0],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  },
  bottomLeft: {
    className: "absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20",
    animate: {
      scale: [1.2, 1, 1.2],
      rotate: [90, 0, 90],
    },
    transition: {
      duration: 20,
      repeat: Infinity,
      ease: "linear"
    }
  },
  center: {
    className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-10",
    animate: {
      scale: [1, 1.1, 1],
      rotate: [45, 90, 45],
    },
    transition: {
      duration: 15,
      repeat: Infinity,
      ease: "linear"
    }
  }
} 