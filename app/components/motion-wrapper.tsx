import { useLocation } from "@remix-run/react"
import { AnimatePresence, motion } from "framer-motion"
import type React from "react"

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
