import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.drugs': 'Drugs',
    'nav.dosage': 'Dosage Calculator',
    'nav.chat': 'Chat with Mira',
    'nav.personalCare': 'Personal Care',

    // Home Page
    'home.welcome': 'Welcome to Say Drugs',
    'home.description': 'Your trusted online pharmacy, providing easy access to medications and health products. Our AI-powered platform simplifies your healthcare journey with features like voice-assisted drug search, dosage calculation, and personalized healthcare with Say Drugs.',
    'home.keyFeatures': 'Key Features',

    // Features
    'features.aiVoiceAssistant.title': 'AI Voice Assistant',
    'features.aiVoiceAssistant.description': 'Meet mira, your intelligent pharmacy assistant',
    'features.drugSearch.title': 'Drug Search',
    'features.drugSearch.description': 'Search Egyptian drug database easily',
    'features.dosageCalculator.title': 'Dosage Calculator',
    'features.dosageCalculator.description': 'AI-powered dosage calculations',
    'features.personalCare.title': 'Personal Care',
    'features.personalCare.description': 'OTC and personal care products',
    
    // Dosage Calculator
    'dosage.title': 'Dosage Calculator',
    'dosage.subtitle': 'AI-powered medication dosage calculations with mira\'s assistance',
    'dosage.patientInfo': 'Patient Information',
    'dosage.drugName': 'Drug Name',
    'dosage.drugNamePlaceholder': 'Enter drug name',
    'dosage.age': 'Age',
    'dosage.agePlaceholder': 'Enter age',
    'dosage.weight': 'Weight (kg)',
    'dosage.weightPlaceholder': 'Enter weight',
    'dosage.specialCategories': 'Special Categories',
    'dosage.selectApplicable': 'Select if applicable',
    'dosage.pediatric': 'Pediatric',
    'dosage.geriatric': 'Geriatric',
    'dosage.pregnancy': 'Pregnancy',
    'dosage.renal': 'Renal Impairment',
    'dosage.hepatic': 'Hepatic Impairment',
    'dosage.calculate': 'Calculate Dosage',
    'dosage.calculating': 'Calculating...',
    'dosage.calculatedDosage': 'Calculated Dosage',
    'dosage.dosage': 'Dosage',
    'dosage.frequency': 'Frequency',
    'dosage.enterInfo': 'Enter information to calculate',
    'dosage.frequencyAppear': 'Dosage frequency will appear here',
    'dosage.importantNotes': 'Important Notes:',
    'dosage.consultProfessional': '• Always consult a healthcare professional',
    'dosage.considerFactors': '• Consider patient-specific factors',
    'dosage.monitorEffects': '• Monitor for side effects',
    'dosage.error': 'Error:',
    
    // Toast messages
    'toast.missingInfo': 'Missing Information',
    'toast.provideDrugAgeWeight': 'Please provide drug name, age, and weight.',
    'toast.invalidInput': 'Invalid Input',
    'toast.validNumbers': 'Please enter valid numbers for age and weight.',
    'toast.dosageCalculated': 'Dosage Calculated',
    'toast.calculationCompleted': 'Medical formula-based calculation completed',
    'toast.calculationFailed': 'Calculation Failed',
    'toast.calculationError': 'An error occurred during calculation.',

    // User
    'user.title': 'User',
    'user.info': 'User info',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.drugs': 'الأدوية',
    'nav.dosage': 'حاسبة الجرعات',
    'nav.chat': 'محادثة مع ميرا',
    'nav.personalCare': 'العناية الشخصية',

    // Home Page
    'home.welcome': 'مرحباً بك في صيدلية قل',
    'home.description': 'صيدليتك الموثوقة عبر الإنترنت، التي توفر سهولة الوصول إلى الأدوية والمنتجات الصحية. منصتنا المدعومة بالذكاء الاصطناعي تبسط رحلتك الصحية بميزات مثل البحث الصوتي عن الأدوية، وحساب الجرعات، والرعاية الصحية الشخصية مع صيدلية قل.',
    'home.keyFeatures': 'الميزات الرئيسية',

    // Features
    'features.aiVoiceAssistant.title': 'مساعد صوتي ذكي',
    'features.aiVoiceAssistant.description': 'تعرف على ميرا، مساعد الصيدلية الذكي الخاص بك',
    'features.drugSearch.title': 'البحث عن دواء',
    'features.drugSearch.description': 'ابحث في قاعدة بيانات الأدوية المصرية بسهولة',
    'features.dosageCalculator.title': 'حاسبة الجرعات',
    'features.dosageCalculator.description': 'حسابات الجرعات بالذكاء الاصطناعي',
    'features.personalCare.title': 'العناية الشخصية',
    'features.personalCare.description': 'منتجات العناية الشخصية والأدوية المتاحة بدون وصفة طبية',
    
    // Dosage Calculator
    'dosage.title': 'حاسبة الجرعات',
    'dosage.subtitle': 'حسابات جرعات الأدوية بالذكاء الاصطناعي مع مساعدة ميرا',
    'dosage.patientInfo': 'معلومات المريض',
    'dosage.drugName': 'اسم الدواء',
    'dosage.drugNamePlaceholder': 'أدخل اسم الدواء',
    'dosage.age': 'العمر',
    'dosage.agePlaceholder': 'أدخل العمر',
    'dosage.weight': 'الوزن (كيلو)',
    'dosage.weightPlaceholder': 'أدخل الوزن',
    'dosage.specialCategories': 'فئات خاصة',
    'dosage.selectApplicable': 'اختر إذا كان ينطبق',
    'dosage.pediatric': 'أطفال',
    'dosage.geriatric': 'كبار السن',
    'dosage.pregnancy': 'الحمل',
    'dosage.renal': 'قصور كلوي',
    'dosage.hepatic': 'قصور كبدي',
    'dosage.calculate': 'احسب الجرعة',
    'dosage.calculating': 'جاري الحساب...',
    'dosage.calculatedDosage': 'الجرعة المحسوبة',
    'dosage.dosage': 'الجرعة',
    'dosage.frequency': 'التكرار',
    'dosage.enterInfo': 'أدخل المعلومات للحساب',
    'dosage.frequencyAppear': 'سيظهر تكرار الجرعة هنا',
    'dosage.importantNotes': 'ملاحظات مهمة:',
    'dosage.consultProfessional': '• استشر دائماً أخصائي الرعاية الصحية',
    'dosage.considerFactors': '• ضع في الاعتبار العوامل الخاصة بالمريض',
    'dosage.monitorEffects': '• راقب الآثار الجانبية',
    'dosage.error': 'خطأ:',
    
    // Toast messages
    'toast.missingInfo': 'معلومات مفقودة',
    'toast.provideDrugAgeWeight': 'يرجى تقديم اسم الدواء والعمر والوزن.',
    'toast.invalidInput': 'إدخال غير صحيح',
    'toast.validNumbers': 'يرجى إدخال أرقام صحيحة للعمر والوزن.',
    'toast.dosageCalculated': 'تم حساب الجرعة',
    'toast.calculationCompleted': 'تم إكمال الحساب القائم على الصيغة الطبية',
    'toast.calculationFailed': 'فشل الحساب',
    'toast.calculationError': 'حدث خطأ أثناء الحساب.',

    // User
    'user.title': 'المستخدم',
    'user.info': 'معلومات المستخدم',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (newLang: Language) => {
    console.log('Changing language from', language, 'to', newLang);
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    console.log('Language changed successfully to:', newLang);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key as keyof typeof translations[typeof language]] || translations.en[key as keyof typeof translations.en];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};