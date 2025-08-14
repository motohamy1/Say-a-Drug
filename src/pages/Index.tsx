import { Layout } from "@/components/Layout/Layout";
import { FeatureCard } from "@/components/Homepage/FeatureCard";
import { Mic, Search, Calculator, Heart } from "lucide-react";
import aiVoiceImage from "@/assets/ai-voice-assistant.jpg";
import drugSearchImage from "@/assets/drug-search.jpg";
import dosageCalculatorImage from "@/assets/dosage-calculator.jpg";
import personalCareImage from "@/assets/personal-care.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();

  const features = [
    {
      title: t('features.aiVoiceAssistant.title'),
      description: t('features.aiVoiceAssistant.description'),
      icon: Mic,
      href: "/voice-assistant",
      image: aiVoiceImage
    },
    {
      title: t('features.drugSearch.title'),
      description: t('features.drugSearch.description'),
      icon: Search,
      href: "/drugs",
      image: drugSearchImage
    },
    {
      title: t('features.dosageCalculator.title'),
      description: t('features.dosageCalculator.description'),
      icon: Calculator,
      href: "/dosage-calculator",
      image: dosageCalculatorImage
    },
    {
      title: t('features.personalCare.title'),
      description: t('features.personalCare.description'),
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
          <h1 className="text-4xl font-bold mb-4 text-foreground">{t('home.welcome')}</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('home.description')}
          </p>
        </div>

        {/* Key Features Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-center text-foreground">{t('home.keyFeatures')}</h2>
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
