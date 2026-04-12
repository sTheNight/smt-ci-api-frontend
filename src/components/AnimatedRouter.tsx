import { AnimatePresence } from "motion/react";
import { Outlet } from "react-router";

export function AnimatedRouter() {
    return (
        <AnimatePresence initial={false}>
            <Outlet />
        </AnimatePresence>
    )
}