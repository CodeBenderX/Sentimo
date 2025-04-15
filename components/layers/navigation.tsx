"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Settings, Bell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon?: React.ReactNode
}

interface MainNavProps {
  items?: NavItem[]
}

export function MainNav({ items = [] }: MainNavProps) {
  const [activePath, setActivePath] = useState("/dashboard")

  // Default navigation items if none provided
  const defaultItems: NavItem[] = [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Journal",
      href: "/journal",
    },
    {
      title: "Our Team",
      href: "/team",
    },
  ]

  const navItems = items.length ? items : defaultItems

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/50 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 font-semibold text-lg text-[#1a365d] mr-6">
          <Image src="/sentimo1.png" width={100} height={32} alt="Sentimo Logo" className="rounded-full" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActivePath(item.href)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#4c51bf]",
                activePath === item.href ? "text-[#4c51bf] font-semibold" : "text-muted-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* User Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Button>
          <Avatar>
            <AvatarImage src="/joyful-portrait.png" alt="User" />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile Navigation Trigger */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden ml-2">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center gap-2 font-semibold text-lg text-[#1a365d] mb-6">
              <Image src="/sentimo1.png" width={100} height={32} alt="Sentimo Logo" className="rounded-full" />
            </div>
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setActivePath(item.href)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-[#4c51bf] p-2 rounded-md",
                    activePath === item.href ? "bg-[#e6f7f0] text-[#4c51bf] font-semibold" : "text-muted-foreground",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
