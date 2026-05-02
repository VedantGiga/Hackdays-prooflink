import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/components/SmoothScroll";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DemoPreview } from "@/components/landing/DemoPreview";
import { CtaSection } from "@/components/landing/CtaSection";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProofLink — One Link. Real Capability." },
      {
        name: "description",
        content:
          "Turn your work into proof. ProofLink aggregates your GitHub, resume and links into an AI-analyzed capability profile recruiters can trust.",
      },
      { property: "og:title", content: "ProofLink — One Link. Real Capability." },
      {
        property: "og:description",
        content: "A single link that shows what you've actually built.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SmoothScroll />
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <DemoPreview />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
