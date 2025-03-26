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
import { toast } from "react-hot-toast"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Schedule Interview", href: "/schedule-interview" },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      await logout()
      toast.success("Successfully signed out!")
    } catch (error) {
      toast.error("Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center">
        <Link 
          href="/" 
          className="mr-8 flex items-center space-x-2 group"
        >
          <span className="text-2xl font-bold text-primary transition-all group-hover:text-primary/80">
            SkillForge
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
                    className="relative rounded-full"
                  >
                    <img
                      src={user.photoURL || "https://github.com/shadcn.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="font-medium">
                    {user.displayName || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    disabled={isLoading}
                    className="
                      transition-all 
                      hover:bg-secondary/30 
                      hover:text-foreground 
                      active:scale-95
                    "
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    disabled={isLoading}
                    className="
                      transition-all 
                      hover:shadow-md 
                      active:scale-95 
                      bg-primary 
                      text-primary-foreground 
                      hover:bg-primary/90
                    "
                  >
                    Get Started
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