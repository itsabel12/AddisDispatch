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

export default function Home() {
  return (
    <>
      <Nav />
      <main>
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
    </>
  );
}
