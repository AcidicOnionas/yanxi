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
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"

// Create a client-side only component to avoid hydration issues
const ClientSideNavbar = () => {
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
                    <ul className="grid gap-3 p-6 md:w-[300px] lg:w-[230px]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-red-500 to-red-700 p-6 no-underline outline-none focus:shadow-md"
                            href="/about"
                          >
                            <div className="mt-4 mb-2 text-lg font-medium text-white">点击了解我们</div>
                          </a>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Courses</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem href="/courses/chinese" title="Chinese Language">
                        From beginner to advanced Chinese language courses
                      </ListItem>
                      <ListItem href="/courses/mathematics" title="Mathematics">
                        Age-appropriate mathematics courses in Chinese and English
                      </ListItem>
                      <ListItem href="/courses/combined" title="Combined Programs">
                        Integrated courses teaching both subjects simultaneously
                      </ListItem>
                      <ListItem href="/courses/summer" title="Summer Intensives">
                        Accelerated learning during school breaks
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/resources" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Resources</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/contact" legacyBehavior passHref>
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact</NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <Button className="bg-red-600 hover:bg-red-700">点击报名</Button>

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
