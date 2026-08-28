import { createBrowserRouter, RouterProvider } from "react-router";
import Shell from "@/components/layout/Shell";
import BoardGaleryPage from "./features/boards/BoardGaleryPage";
import BoardPage from "./features/boards/BoardPage";
import OverviewPage from "./features/overview/OverviewPage";
import PlannerPage from "./features/planner/PlannerPage";
import { useEffect } from "react";
import { useAppStore } from "./store/useAppStore";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      {
        index: true,
        element: <OverviewPage />
      },
      {
        path: "planner",
        element: <PlannerPage />
      },
      {
        path: "boards",
        element: <BoardGaleryPage />
      },
      {
        path: "boards/:id",
        element: <BoardPage />
      }
    ]
  }
])

export default function App() {
  const state = useAppStore()
  useEffect(() => {
    state.fetchBootstrap()
  }, [])

  return (
    <RouterProvider router={router} />
  )
}
