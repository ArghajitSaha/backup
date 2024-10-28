import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { twMerge } from "tailwind-merge"
import { dark, neobrutalism, shadesOfPurple } from "@clerk/themes"
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignIn,
  SignInButton,
  UserButton,
} from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Startup Landing Page",
  description: "A landing page for an AI startup created with Frontend Tribe",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      // appearance={{
      //   baseTheme: [dark, neobrutalism],
      //   variables: { colorPrimary: "blue" },
      //   signIn: {
      //     baseTheme: [shadesOfPurple],
      //     variables: { colorPrimary:"yellow" },
      //   },
      // }}
      appearance={{
        
        signIn: { baseTheme: neobrutalism },
      }}
    >
      <html lang="en">
        <body
          className={twMerge(
            inter.className,
            "bg-black text-white antialiased"
          )}
        >
          <SignedOut></SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
