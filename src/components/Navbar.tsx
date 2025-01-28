import Link from "next/link";
import React from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/actions/user.action";

async function Navbar() {
  const user = await currentUser();
  if (user) await syncUser();
  return (
    <nav className="sticky top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
      <div className="w-full px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-primary font-mono tracking-wide"
            >
              QuizPlay
            </Link>
          </div>
          <DesktopNavbar />
          <MobileNavbar />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
