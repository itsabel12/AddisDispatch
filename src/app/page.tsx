import { Roboto_Slab, Roboto } from "next/font/google";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Value from "@/components/Value";
import DataEdge from "@/components/DataEdge";
import Services from "@/components/Services";
import Timeline from "@/components/Timeline";
import Profit from "@/components/Profit";
import Tracker from "@/components/Tracker";
import Calculator from "@/components/Calculator";
import WhoWeServe from "@/components/WhoWeServe";
import About from "@/components/About";
import Pricing from "@/components/Pricing";
import Cta from "@/components/Cta";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import Overlays from "@/components/overlays/Overlays";
import StructuredData from "@/components/StructuredData";
import { SkipLink } from "@/components/ui/skip-link";

// Homepage-only typography — the "Roboto Slab" pairing selected in Figma
// (file HgOKa4AeGkXcvqZ5h3XweP): Roboto Slab for display, Roboto for body/UI.
// Scoped via `.home-type` (globals.css) so every other route keeps the
// Bricolage/Hanken pairing from the root layout.
const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-roboto-slab",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export default function Home() {
  return (
    <div className={`${robotoSlab.variable} ${roboto.variable} home-type contents`}>
      <SkipLink />
      <StructuredData />
      <Nav />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <Value />
        <DataEdge />
        <Services />
        <Timeline />
        <Profit />
        <Tracker />
        <Calculator />
        <WhoWeServe />
        <About />
        <Pricing />
        <Cta />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
      <Overlays />
    </div>
  );
}
