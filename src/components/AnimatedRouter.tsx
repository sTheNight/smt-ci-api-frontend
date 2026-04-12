import { AnimatePresence } from "motion/react";
import { Outlet, useLocation } from "react-router";
import { motion } from "motion/react"

export function AnimatedRouter() {
    const location = useLocation()
    return (
        <AnimatePresence initial={false} mode="wait">
            <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeInOut" } }}
            >
                <Outlet />
            </motion.div>
        </AnimatePresence>
    )
}