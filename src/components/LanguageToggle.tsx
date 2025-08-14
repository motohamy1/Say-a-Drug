import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages } from "lucide-react";

export const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    console.log('Switching language from', language, 'to', newLang);
    setLanguage(newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLanguageChange}
      className="flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === 'en' ? 'العربية' : 'English'}
    </Button>
  );
};