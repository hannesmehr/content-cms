import React from 'react'
import './globals.css'

/* Root layout is intentionally minimal — no <html>/<body> tags here.
   The (payload) route group provides its own RootLayout with <html>.
   The (site) route group provides its own layout with <html>.
   This avoids duplicate <html> nesting. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
