"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ChevronDown, Sprout } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"
import { UserButton } from "./user-button"
import { ReminderNotification } from "@/components/reminder-notification"

interface NavItem {
  name: string
  href: string
  hasDropdown?: boolean
  dropdownItems?: { name: string; href: string; description?: string }[]
}

const navItems: NavItem[] = [
  { name: "Beranda", href: "/" },
  { name: "Edukasi", href: "/edukasi" },
  { name: "Deteksi", href: "/deteksi" },
  // { name: "Dashboard", href: "/dashboard" },
  { name: "Komunitas", href: "/komunitas" },
]

const normalize = (p: string) => {
  if (!p) return "/"
  if (p !== "/" && p.endsWith("/")) return p.slice(0, -1)
  return p
}

const isActive = (href: string, pathname: string) => {
  const h = normalize(href)
  const p = normalize(pathname)
  if (h === "/") return p === "/"
  return p === h || p.startsWith(h + "/")
}

const isDropdownActive = (item: NavItem, pathname: string) => {
  if (isActive(item.href, pathname)) return true
  if (!item.dropdownItems?.length) return false
  return item.dropdownItems.some((d) => isActive(d.href, pathname))
}

const linkBase = "relative inline-flex items-center gap-1 px-3 py-2 font-medium transition-colors group"

const cornersBase = "pointer-events-none absolute inset-0 rounded-md"

const corner = "absolute h-3 w-3 border-primary transition-all duration-200 opacity-0 " + "group-hover:opacity-100"

const cornerActive = "opacity-100"

export default function Header() {
  const { data: session, isPending } = authClient.useSession()
  const isAuthenticated = !!session?.user && !isPending

  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: "auto" },
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  }

  return (
    <header className="sticky top-0 right-0 left-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Link prefetch={false} href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-xl font-bold text-transparent">
                AgroWin
              </span>
            </Link>
          </motion.div>

          <nav className="hidden items-center space-x-8 lg:flex">
            {navItems.map((item) => {
              const active = isDropdownActive(item, pathname)
              return (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    prefetch={false}
                    href={item.href}
                    className={`${linkBase} ${active ? "text-primary" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {item.hasDropdown && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          active ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    )}

                    {/* FRAME SUDUT */}
                    <span aria-hidden className={cornersBase}>
                      {/* Top-Left */}
                      <span
                        className={`${corner} -top-1 -left-1 border-t-2 border-l-2 ${active ? cornerActive : ""}`}
                      />
                      {/* Top-Right */}
                      <span
                        className={`${corner} -top-1 -right-1 border-t-2 border-r-2 ${active ? cornerActive : ""}`}
                      />
                      {/* Bottom-Left */}
                      <span
                        className={`${corner} -bottom-1 -left-1 border-b-2 border-l-2 ${active ? cornerActive : ""}`}
                      />
                      {/* Bottom-Right */}
                      <span
                        className={`${corner} -bottom-1 -right-1 border-b-2 border-r-2 ${active ? cornerActive : ""}`}
                      />
                    </span>
                  </Link>

                  {item.hasDropdown && (
                    <AnimatePresence>
                      {activeDropdown === item.name && (
                        <motion.div
                          className="border-border bg-background/95 absolute top-full left-0 mt-2 w-64 overflow-hidden rounded-xl border shadow-xl backdrop-blur-lg"
                          variants={dropdownVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          transition={{ duration: 0.2 }}
                        >
                          {item.dropdownItems?.map((dropdownItem) => {
                            const childActive = isActive(dropdownItem.href, pathname)
                            return (
                              <Link
                                prefetch={false}
                                key={dropdownItem.name}
                                href={dropdownItem.href}
                                className={`hover:bg-muted block px-4 py-3 transition-colors duration-200 ${
                                  childActive ? "text-primary font-semibold" : "text-foreground"
                                }`}
                                aria-current={childActive ? "page" : undefined}
                              >
                                <div className="font-medium">{dropdownItem.name}</div>
                                {dropdownItem.description && (
                                  <div className="text-muted-foreground text-sm">{dropdownItem.description}</div>
                                )}
                              </Link>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              )
            })}
          </nav>

          <div className="hidden items-center space-x-4 lg:flex">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex-shrink-0 flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <ReminderNotification />
                    <UserButton />
                  </>
                ) : (
                  <Link href="/login">
                    <Button variant="outline">Login</Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>

          {/* Mobile toggler */}
          <motion.button
            className="hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="overflow-hidden lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="border-border bg-background/95 mt-4 space-y-2 rounded-xl border py-4 shadow-xl backdrop-blur-lg">
                {navItems.map((item) => {
                  const active = isDropdownActive(item, pathname)
                  return (
                    <Link
                      prefetch={false}
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-3 font-medium transition-colors duration-200 ${
                        active ? "text-primary" : "text-foreground hover:bg-muted"
                      }`}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )
                })}
                <div className="space-y-2 px-4 py-2">
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <ReminderNotification />
                      <UserButton />
                    </div>
                  ) : (
                    <Link href="/login">
                      <Button variant="outline">Login</Button>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
