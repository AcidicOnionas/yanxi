"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

// Create a client-side only component to avoid hydration issues
const ClientSideNavbar = () => {
  const { user, role, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logged out successfully");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 width">
          <img 
              src="/Logo.jpg" 
              alt="Chinese-Math Academy Logo" 
              className="h-24 w-auto" 
          />
          </Link>

          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>About</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 md:w-[300px] lg:w-[230px]">
                      <ListItem href="/about" title="About Us">
                        Click here to learn more about us
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/courses" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Courses</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/resources" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Resources</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                
                {/* Show dashboard link based on user role */}
                {user && (
                  <NavigationMenuItem>
                    <Link 
                      href={role === 'teacher' ? '/teacher-portal' : '/dashboard'} 
                      legacyBehavior 
                      passHref
                    >
                      <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                        {role === 'teacher' ? 'Teacher Portal' : 'Dashboard'}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                <Link href="/" className="text-lg font-medium">
                  Home
                </Link>
                <Link href="/about" className="text-lg font-medium">
                  About
                </Link>
                <Link href="/courses" className="text-lg font-medium">
                  Courses
                </Link>
                <Link href="/resources" className="text-lg font-medium">
                  Resources
                </Link>
                <Link href="/contact" className="text-lg font-medium">
                  Contact
                </Link>
                {user ? (
                  <>
                    <Link 
                      href={role === 'teacher' ? '/teacher-portal' : '/dashboard'} 
                      className="text-lg font-medium"
                    >
                      {role === 'teacher' ? 'Teacher Portal' : 'Dashboard'}
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="text-lg font-medium text-left text-red-600"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-lg font-medium">
                      Log In
                    </Link>
                    <Link href="/signup" className="text-lg font-medium">
                      Sign Up
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// Server-side fallback for initial render
const ServerFallback = () => (
  <header className="sticky top-0 z-50 w-full border-b bg-white">
    <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-red-600 font-bold">C</span>
          </div>
          <span className="font-bold">Chinese Academy</span>
        </div>
        <div className="w-8 h-8"></div>
      </div>
    </div>
  </header>
)

// Use dynamic import with SSR disabled to avoid hydration issues
const NavbarWithNoSSR = dynamic(() => Promise.resolve(ClientSideNavbar), {
  ssr: false,
})

export default function Navbar() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <ServerFallback />
  }

  return <NavbarWithNoSSR />
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className,
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  },
)
ListItem.displayName = "ListItem"
