import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'sonner'
import { TooltipProvider } from './components/ui/tooltip.tsx'
import { RouterProvider } from "react-router/dom";
import { router } from './router/router.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster position='top-center' />
    </TooltipProvider>
  </StrictMode>,
)