import { HistoryPage } from "@/pages/History";
import { MainPage } from "@/pages/MainPage";
import { createBrowserRouter } from "react-router";
export const router = createBrowserRouter([
    {
        path: '/',
        Component: MainPage
    },
    {
        path: '/history',
        Component: HistoryPage
    }
])