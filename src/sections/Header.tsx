import MenuIcon from "@/assets/icon-menu.svg"
import { Button } from "@/components/button"
import { GlazeButton } from "@/components/glaze-button"
import Logo from "@/assets/logo-w.png"
import { auth } from "@clerk/nextjs/server"
import Link from "next/link"

export const Header = async () => {
  const { userId, redirectToSignIn } = await auth()
  return (
    <header className="py-4 border-b border-white/15 md:border-none sticky top-0 z-10 ">
      <div className="absolute inset-0 backdrop-blur -z-10 md:hidden"></div>
      <div className="container">
        <div className="flex justify-between items-center md:border rounded-lg border-white/15  md:py-2.5 md:px-5 max-w-2xl mx-auto relative ">
          <div className="hidden md:block absolute inset-0 backdrop-blur -z-10 "></div>
          <div>
            {/* To make the border of the Logo inline-flex to make it in center aligfned with Logo */}
            <div className="border h-10 w-28 rounded-xl border-white/15 inline-flex justify-center items-center mr-10">
              <img src={Logo.src} />{" "}
            </div>
          </div>
          <div className="hidden md:block">
            <nav className="flex gap-8 text-sm ">
              <a
                className="text-white/70 hover:text-white transition "
                href="#"
              >
                Developers
              </a>
              <a
                className="text-white/70 hover:text-white transition "
                href="#"
              >
                Pricing
              </a>
              <a
                className="text-white/70 hover:text-white transition "
                href="#"
              >
                Changelog
              </a>
            </nav>
          </div>
          <div className="flex gap-4 items-center">
            <Link href={userId ? "/dashboard" : "/sign-up"}>
              <Button />
            </Link>
            <MenuIcon className="md:hidden" />
          </div>
        </div>
      </div>
    </header>
  )
}
