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

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-24 items-center justify-between">
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
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-red-500 to-red-700 p-6 no-underline outline-none focus:shadow-md"
                          href="/about"
                        >
                          <div className="mt-4 mb-2 text-lg font-medium text-white">Our Story</div>
                          <p className="text-sm leading-tight text-white/90">
                            Learn about our mission to integrate Chinese language and mathematics education
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/philosophy" title="Our Philosophy">
                      Our unique approach to bilingual education
                    </ListItem>
                    <ListItem href="/team" title="Our Team">
                      Meet our experienced teachers and staff
                    </ListItem>
                    <ListItem href="/facilities" title="Our Facilities">
                      Tour our modern learning environment
                    </ListItem>
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

        <div className="hidden md:block">
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link href="#courses">Enroll Now</Link>
          </Button>
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
              <Button asChild className="mt-4 bg-red-600 hover:bg-red-700">
                <Link href="#courses">Enroll Now</Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
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
