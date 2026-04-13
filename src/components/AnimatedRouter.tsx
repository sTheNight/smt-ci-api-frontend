import { AnimatePresence } from "motion/react";
import { useLocation, useOutlet } from "react-router";
import { motion } from "motion/react"

export function AnimatedRouter() {
    const location = useLocation()
    const outlet = useOutlet()
    return (
        <AnimatePresence initial={false} mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.1, ease: "easeInOut" } }}
            >
                {outlet}
            </motion.div>
        </AnimatePresence>
    )
}