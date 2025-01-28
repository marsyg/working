"use client";

import {
  BookIcon,
  TrophyIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  LogOutIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import Link from "next/link";

function MobileNavbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isSignedIn } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex md:hidden items-center space-x-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="mr-3"
      >
        <SunIcon className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonIcon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-5 mt-6">
            <Button variant="ghost" className="flex items-center gap-4 justify-start text-lg" asChild>
              <Link href="/leaderboard">
                <TrophyIcon className="w-5 h-5" />
                Leaderboard
              </Link>
            </Button>

            <Button variant="ghost" className="flex items-center gap-4 justify-start text-lg" asChild>
              <Link href="/playlists">
                <BookIcon className="w-5 h-5" />
                Playlists
              </Link>
            </Button>

            {isSignedIn ? (
              <>
                <Button variant="ghost" className="flex items-center gap-4 justify-start text-lg" asChild>
                  <Link href="/profile">
                    <UserIcon className="w-5 h-5" />
                    Profile
                  </Link>
                </Button>
                <SignOutButton>
                  <Button variant="ghost" className="flex items-center gap-4 justify-start w-full text-lg">
                    <LogOutIcon className="w-5 h-5" />
                    Logout
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <Button variant="default" className="w-full text-lg">Sign In</Button>
              </SignInButton>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MobileNavbar;
