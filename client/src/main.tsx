import {StrictMode, Suspense} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {MainPageLazy} from "./pages/MainPage/MainPage.lazy.ts";
import {EditorPage} from "./pages/EditorPage";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Suspense fallback={<div>Loading...</div>}>
      <MainPageLazy/>
    </Suspense>
  },
  {
    path: '/:id',
    element: <EditorPage/>
  }
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
