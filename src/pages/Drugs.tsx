import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Database } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Drug {
  Drugname?: string;
  Price?: number;
  Company?: string;
  Form?: string;
  Category?: string;
  [key: string]: any;
}

const translations = {
  "Egyptian Drug Database": { en: "Egyptian Drug Database", ar: "قاعدة بيانات الأدوية المصرية" },
  "Search and browse medications from the Egyptian Drug Authority (EDA)": { en: "Search and browse medications from the Egyptian Drug Authority (EDA)", ar: "ابحث وتصفح الأدوية من هيئة الدواء المصرية (EDA)" },
  "Database Status": { en: "Database Status", ar: "حالة قاعدة البيانات" },
  "Ready to search": { en: "Ready to search", ar: "جاهز للبحث" },
  "Refresh": { en: "Refresh", ar: "تحديث" },
  "Type to search drugs by name, company, or category...": { en: "Type to search drugs by name, company, or category...", ar: "اكتب للبحث عن الأدوية بالاسم أو الشركة أو الفئة ..." },
  "Showing results for": { en: "Showing results for", ar: "عرض نتائج" },
  "drugs found": { en: "drugs found", ar: "تم العثور على الأدوية" },
  "No drugs found matching your search.": { en: "No drugs found matching your search.", ar: "لم يتم العثور على أدوية مطابقة لبحثك." },
  "Start typing to search for drugs...": { en: "Start typing to search for drugs...", ar: "ابدأ الكتابة للبحث عن الأدوية ..." },
  "Company": { en: "Company", ar: "الشركة" },
  "Dosage Form": { en: "Dosage Form", ar: "شكل الجرعة" },
  "Category": { en: "Category", ar: "الفئة" },
};

export default function Drugs() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<string>("Ready to search");

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const searchDrugs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setDatabaseStatus(t("Ready to search"));
      return;
    }

    setLoading(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/drugs/search?q=${encodeURIComponent(query)}&limit=50`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const drugsData = data.data?.drugs || [];
      
      setSearchResults(drugsData);
      setDatabaseStatus(`${drugsData.length} ${t("drugs found")}`);
    } catch (error: any) {
      console.error("Error searching drugs:", error);
      setDatabaseStatus(`Error: ${error.message || 'Unknown error'}`);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchDrugs(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchDrugs]);

  const handleRefresh = () => {
    if (searchTerm.trim()) {
      searchDrugs(searchTerm);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("Egyptian Drug Database")}
          </h1>
          <p className="text-muted-foreground">
            {t("Search and browse medications from the Egyptian Drug Authority (EDA)")}
          </p>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-primary mr-2" />
                <span className="text-sm text-foreground">
                  {t("Database Status")}: {databaseStatus}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                {t("Refresh")}
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder={t("Type to search drugs by name, company, or category...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              {t("Showing results for")} "{searchTerm}" - {searchResults.length} {t("drugs found")}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((drug: Drug, index: number) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-foreground">
                    {drug.Drugname || 'N/A'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">{t("Company")}:</span> {drug.Company || 'N/A'}</p>
                    <p><span className="font-medium">{t("Dosage Form")}:</span> {drug.Form || 'N/A'}</p>
                    {drug.Category && (
                      <p><span className="font-medium">{t("Category")}:</span> {drug.Category}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? t("No drugs found matching your search.") : t("Start typing to search for drugs...")}
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}