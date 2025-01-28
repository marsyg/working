import { TrophyIcon, BookIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ModeToggle from "./ModeToggle";
import { currentUser } from "@clerk/nextjs/server";

async function DesktopNavbar() {
  const user = await currentUser();

  return (
    <div className="hidden md:flex items-center space-x-6">
      <ModeToggle />

      <Button variant="ghost" className="flex items-center gap-3 text-lg" asChild>
        <Link href="/leaderboard">
          <TrophyIcon className="w-5 h-5" />
          <span>Leaderboard</span>
        </Link>
      </Button>

      <Button variant="ghost" className="flex items-center gap-3 text-lg" asChild>
        <Link href="/playlists">
          <BookIcon className="w-5 h-5" />
          <span>Playlists</span>
        </Link>
      </Button>

      {user ? (
        <>
          <Button variant="ghost" className="flex items-center gap-3 text-lg" asChild>
            <Link href={`/profile/${user.id}`}>
              <UserIcon className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </Button>
          <UserButton />
        </>
      ) : (
        <SignInButton mode="modal">
          <Button variant="default" className="text-lg">Sign In</Button>
        </SignInButton>
      )}
    </div>
  );
}

export default DesktopNavbar;
