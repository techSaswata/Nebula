"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { toast } from "sonner"

const publicNavigation = [
  { name: "Home", href: "/home" },
  { name: "Courses", href: "/courses" },
]

const authenticatedNavigation = [
  { name: "Home", href: "/home" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Schedule Interview", href: "/schedule-interview" },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await signOut()
      toast.success("Successfully signed out!")
    } catch (error) {
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = user ? authenticatedNavigation : publicNavigation

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <Link 
          href="/home" 
          className="mr-8 flex items-center space-x-2 group"
        >
          <span className="text-2xl font-bold text-primary transition-all group-hover:text-primary/80">
            AcademiX
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  text-sm font-medium 
                  relative 
                  transition-colors 
                  hover:text-primary 
                  group
                  ${pathname === item.href 
                    ? "text-foreground font-semibold" 
                    : "text-foreground/60"
                  }
                `}
              >
                {item.name}
                <span 
                  className={`
                    absolute 
                    bottom-[-4px] 
                    left-0 
                    w-0 
                    h-0.5 
                    bg-primary 
                    transition-all 
                    duration-300 
                    group-hover:w-full
                    ${pathname === item.href ? "w-full" : ""}
                  `}
                />
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative rounded-full group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    <img
                      src="https://github.com/shadcn.png"
                      alt="Profile"
                      className="w-8 h-8 rounded-full ring-2 ring-white/80 transform transition-all duration-300 group-hover:scale-110 group-hover:ring-indigo-500"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className="w-56 mt-2 p-1 bg-white/90 backdrop-blur-lg border border-white/20 shadow-xl shadow-indigo-500/10 rounded-xl animate-in slide-in-from-top-2 duration-200"
                >
                  <DropdownMenuItem className="flex flex-col items-start space-y-1 p-3 m-1 rounded-lg cursor-default bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                    <span className="font-medium bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {user.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user.email}
                    </span>
                  </DropdownMenuItem>
                  <div className="p-1">
                    <DropdownMenuItem className="flex items-center gap-2 p-2 m-1 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-purple-600 group">
                      <Link href="/dashboard" className="flex items-center gap-2 w-full group-hover:text-purple-600 transition-colors">
                        <svg className="w-4 h-4 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2 p-2 m-1 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-purple-600 group">
                      <Link href="/profile" className="flex items-center gap-2 w-full group-hover:text-purple-600 transition-colors">
                        <svg className="w-4 h-4 group-hover:text-purple-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 p-2 m-1 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-600 group"
                    >
                      <svg className="w-4 h-4 group-hover:text-rose-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span className="group-hover:text-rose-600 transition-colors">Sign out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={isLoading}
                    className="relative group overflow-hidden rounded-full px-6 py-2 transition-all duration-300 hover:bg-transparent"
                  >
                    <span className="relative z-10 text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                      Sign in
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    disabled={isLoading}
                    className="relative group overflow-hidden rounded-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <span className="relative z-10 text-sm font-medium">
                      Get Started
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-[-100%] group-hover:translate-x-[100%]" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}