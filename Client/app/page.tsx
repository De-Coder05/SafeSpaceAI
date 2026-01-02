"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import HeroSection from "./components/HeroSection"
import AboutSection from "./components/AboutSection"
import Footer from "./components/Footer"

gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  const infoRef = useRef<HTMLDivElement>(null)

  const scrollToInfo = () => {
    infoRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <main className="min-h-screen">
      <HeroSection onLearnMore={scrollToInfo} />
      <div ref={infoRef}>
        <AboutSection />
      </div>
      <Footer />
    </main>
  )
}
