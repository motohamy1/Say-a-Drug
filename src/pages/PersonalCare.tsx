import { Layout } from "@/components/Layout/Layout";
import CategoryCard from "@/components/PersonalCare/CategoryCard";
import { useLanguage } from "@/contexts/LanguageContext";

const personalCareCategories = [
  { id: "skin-care", name: "Skin care" },
  { id: "female-care", name: "Female Care" },
  { id: "oral-care", name: "Oral Care" },
  { id: "hair-care", name: "Hair care" },
  { id: "mens-care", name: "Men’s Care" },
  { id: "baby-care", name: "Baby Care" },
];

const translations = {
  "Personal Care": { en: "Personal Care", ar: "العناية الشخصية" },
  "coming soon...": { en: "coming soon...", ar: "قريبا..." },
  "Skin care": { en: "Skin care", ar: "العناية بالبشرة" },
  "Female Care": { en: "Female Care", ar: "العناية النسائية" },
  "Oral Care": { en: "Oral Care", ar: "العناية بالفم" },
  "Hair care": { en: "Hair care", ar: "العناية بالشعر" },
  "Men’s Care": { en: "Men’s Care", ar: "العناية بالرجال" },
  "Baby Care": { en: "Baby Care", ar: "العناية بالطفل" },
  "Personal<br/>Care": { en: "Personal<br/>Care", ar: "العناية<br/>الشخصية" },
};

export default function PersonalCare() {
  const { language } = useLanguage();
  const categoryImages: { [key: string]: string } = {
    "Skin care": "/placeholder.svg",
    "Female Care": "/placeholder.svg",
    "Oral Care": "/placeholder.svg",
    "Hair care": "/placeholder.svg",
    "Men’s Care": "/placeholder.svg",
    "Baby Care": "/placeholder.svg",
  };

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  return (
    <Layout>
      <div className="flex-1 bg-background text-foreground">
        <h1 className="text-2xl font-semibold text-foreground pl-4 mb-6">
          {t("Personal Care")}
        </h1>
        <h2 className="font-semibold text-foreground pl-4 mb-6">
          {t("coming soon...")}
        </h2>

        <div className="relative w-full max-w-5xl mx-auto mt-6 mb-2 px-2">
          <div className="relative w-[500px] h-[500px] mx-auto">
            {personalCareCategories.map((category, index) => {
              const angle = (index * 360) / personalCareCategories.length;
              const radius = 180; // Distance from center - increased for better spacing
              const x = Math.cos((angle - 90) * (Math.PI / 180)) * radius;
              const y = Math.sin((angle - 90) * (Math.PI / 180)) * radius;
              
              return (
                <div
                  key={category.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                  }}
                >
                  <CategoryCard
                    title={t(category.name as keyof typeof translations)}
                    imgSrc={categoryImages[category.name]}
                  />
                </div>
              );
            })}
            
            {/* Center element - optional logo or title */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <span
                    className="text-primary-foreground font-semibold text-sm text-center"
                    dangerouslySetInnerHTML={{ __html: t("Personal<br/>Care") }}
                  />
              </div>
            </div>
          </div>
          
          {/* Mobile fallback - stack vertically on small screens */}
          <div className="block sm:hidden mt-8">
            <div className="grid grid-cols-1 gap-6">
              {personalCareCategories.map((category) => (
                <CategoryCard
                  key={`mobile-${category.id}`}
                  title={t(category.name as keyof typeof translations)}
                  imgSrc={categoryImages[category.name]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}