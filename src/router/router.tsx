import { AnimatedRouter } from "@/components/AnimatedRouter";
import { HistoryPage } from "@/pages/History";
import { MainPage } from "@/pages/MainPage";
import { createBrowserRouter } from "react-router";
export const router = createBrowserRouter([
    {
        path: '/',
        Component: AnimatedRouter,
        children: [
            {
                index: true,
                Component: MainPage
            },
            {
                path: '/history',
                Component: HistoryPage
            }
        ]
    }
])