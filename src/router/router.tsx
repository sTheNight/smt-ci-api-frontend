import { AnimatedRouter } from "@/components/AnimatedRouter";
import { createBrowserRouter } from "react-router";
export const router = createBrowserRouter([
    {
        path: '/',
        Component: AnimatedRouter,
        children: [
            {
                index: true,
                lazy: async () => {
                    const { MainPage } = await import("@/pages/MainPage")
                    return { Component: MainPage }
                }
            },
            {
                path: '/history',
                lazy: async () => {
                    const { HistoryPage } = await import("@/pages/History")
                    return { Component: HistoryPage }
                }
            },
            {
                path: "*",
                lazy: async () => {
                    const { NotFound } = await import("@/pages/NotFound")
                    return { Component: NotFound }
                }
            }
        ]
    }
])
