import { Layout } from "@/components/Layout/Layout";
import { FeatureCard } from "@/components/Homepage/FeatureCard";
import { Mic, Search, Calculator, Heart } from "lucide-react";
import aiVoiceImage from "@/assets/ai-voice-assistant.jpg";
import drugSearchImage from "@/assets/drug-search.jpg";
import dosageCalculatorImage from "@/assets/dosage-calculator.jpg";
import personalCareImage from "@/assets/personal-care.jpg";

const Index = () => {
  const features = [
    {
      title: "AI Voice Assistant",
      description: "Meet mira, your intelligent pharmacy assistant",
      icon: Mic,
      href: "/voice-assistant",
      image: aiVoiceImage
    },
    {
      title: "Drug Search",
      description: "Search Egyptian drug database easily",
      icon: Search,
      href: "/drugs",
      image: drugSearchImage
    },
    {
      title: "Dosage Calculator",
      description: "AI-powered dosage calculations",
      icon: Calculator,
      href: "/dosage-calculator",
      image: dosageCalculatorImage
    },
    {
      title: "Personal Care",
      description: "OTC and personal care products",
      icon: Heart,
      href: "/personal-care",
      image: personalCareImage
    }
  ];

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to Say Drugs</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Your trusted online pharmacy, providing easy access to medications and health products.
            Our AI-powered platform simplifies your healthcare journey with features like voice-assisted
            drug search, dosage calculation, and personalized healthcare with Say Drugs.
          </p>
        </div>

        {/* Key Features Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                href={feature.href}
              />
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
