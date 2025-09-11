"use client"

import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      window.location.href = '/'
    }
  }, [])

  return <>{children}</>
}


