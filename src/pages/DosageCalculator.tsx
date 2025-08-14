import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

// import { drugsAPI } from "@/services/api";

export default function DosageCalculator() {
  const [drugName, setDrugName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [calculatedDose, setCalculatedDose] = useState("");
  const [frequency, setFrequency] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();



  // Calculate Body Surface Area (BSA) using Mosteller formula
  const calculateBSA = (weight: number, height: number = 120) => {
    // BSA (m²) = √[(height(cm) × weight(kg)) / 3600]
    // Using average height if not provided
    return Math.sqrt((height * weight) / 3600);
  };

  // Medical dosage calculation with proper formulas
  const calculateDosageFormula = (drug: string, ageValue: number, weightValue: number) => {
    const drugLower = drug.toLowerCase();
    
    // Comprehensive drug database with proper medical formulas
    const drugDatabase: { [key: string]: {
      pediatricDose: { mgPerKg: number, minAge?: number, maxAge?: number },
      adultDose: { mg: number },
      maxSingleDose: number,
      maxDailyDose: number,
      frequency: string,
      contraindications?: string[]
    }} = {
      'paracetamol': {
        pediatricDose: { mgPerKg: 15, minAge: 0, maxAge: 18 },
        adultDose: { mg: 500 },
        maxSingleDose: 1000,
        maxDailyDose: 4000,
        frequency: 'Every 4-6 hours (max 4 doses/day)'
      },
      'panadol': {
        pediatricDose: { mgPerKg: 15, minAge: 0, maxAge: 18 },
        adultDose: { mg: 500 },
        maxSingleDose: 1000,
        maxDailyDose: 4000,
        frequency: 'Every 4-6 hours (max 4 doses/day)'
      },
      'ibuprofen': {
        pediatricDose: { mgPerKg: 10, minAge: 6, maxAge: 18 },
        adultDose: { mg: 400 },
        maxSingleDose: 600,
        maxDailyDose: 2400,
        frequency: 'Every 6-8 hours (max 3 doses/day)',
        contraindications: ['under 6 months', 'asthma', 'kidney disease']
      },
      'amoxicillin': {
        pediatricDose: { mgPerKg: 25, minAge: 0, maxAge: 18 },
        adultDose: { mg: 500 },
        maxSingleDose: 1000,
        maxDailyDose: 3000,
        frequency: 'Every 8 hours (3 times daily)'
      },
      'aspirin': {
        pediatricDose: { mgPerKg: 0, minAge: 16, maxAge: 18 }, // Not recommended for children
        adultDose: { mg: 325 },
        maxSingleDose: 1000,
        maxDailyDose: 4000,
        frequency: 'Every 4-6 hours',
        contraindications: ['under 16 years', 'Reye syndrome risk']
      }
    };
    
    // Find matching drug
    const matchedDrug = Object.keys(drugDatabase).find(key => drugLower.includes(key));
    
    if (!matchedDrug) {
      return {
        dose: 'Drug not found in database',
        frequency: 'Consult healthcare professional',
        warnings: ['Unknown drug - professional consultation required']
      };
    }
    
    const drugInfo = drugDatabase[matchedDrug];
    let calculatedDose: number;
    let warnings: string[] = [];
    
    // Age-based dosing logic
    if (ageValue < 18) {
      // Pediatric dosing
      if (drugInfo.pediatricDose.minAge && ageValue < drugInfo.pediatricDose.minAge) {
        warnings.push(`Not recommended for children under ${drugInfo.pediatricDose.minAge} years`);
      }
      
      // Weight-based calculation for pediatrics
      calculatedDose = drugInfo.pediatricDose.mgPerKg * weightValue;
      
      // Apply safety limits
      if (calculatedDose > drugInfo.maxSingleDose) {
        calculatedDose = drugInfo.maxSingleDose;
        warnings.push('Dose limited to maximum safe amount');
      }
    } else {
      // Adult dosing
      calculatedDose = drugInfo.adultDose.mg;
      
      // Weight adjustment for adults (if significantly different from average 70kg)
      if (weightValue < 50) {
        calculatedDose = calculatedDose * (weightValue / 70);
        warnings.push('Dose adjusted for low body weight');
      } else if (weightValue > 100) {
        calculatedDose = Math.min(calculatedDose * 1.2, drugInfo.maxSingleDose);
        warnings.push('Dose may need adjustment for high body weight');
      }
    }
    
    // Add contraindication warnings
    if (drugInfo.contraindications) {
      warnings.push(...drugInfo.contraindications.map(c => `Contraindication: ${c}`));
    }
    
    // Calculate daily dose
    const dailyDoses = drugInfo.frequency.includes('3 times') ? 3 : 
                      drugInfo.frequency.includes('4 doses') ? 4 : 
                      drugInfo.frequency.includes('6-8 hours') ? 3 : 4;
    
    const totalDailyDose = calculatedDose * dailyDoses;
    
    if (totalDailyDose > drugInfo.maxDailyDose) {
      warnings.push(`Total daily dose exceeds maximum (${drugInfo.maxDailyDose}mg/day)`);
    }
    
    return {
      dose: `${calculatedDose.toFixed(1)} mg per dose`,
      frequency: drugInfo.frequency,
      dailyDose: `${totalDailyDose.toFixed(1)} mg/day`,
      maxDailyDose: `${drugInfo.maxDailyDose} mg/day`,
      warnings: warnings.length > 0 ? warnings : ['Always consult healthcare professional']
    };
  };

  const handleCalculate = useCallback(() => {
    if (!drugName.trim() || !age.trim() || !weight.trim()) {
      toast({
        title: t('toast.missingInfo'),
        description: t('toast.provideDrugAgeWeight'),
        variant: "destructive",
      });
      return;
    }

    const ageValue = parseInt(age);
    const weightValue = parseFloat(weight);
    
    if (isNaN(ageValue) || isNaN(weightValue)) {
      toast({
        title: t('toast.invalidInput'),
        description: t('toast.validNumbers'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = calculateDosageFormula(drugName, ageValue, weightValue);
      
      // Format the complete dosage information
      const dosageInfo = `- ${result.dose}\n- ${result.dailyDose ? `Daily Total: ${result.dailyDose}` : ''}\n- ${result.maxDailyDose ? `Max Daily Dose: ${result.maxDailyDose}` : ''}`;
      const frequencyInfo = `${result.frequency}`;
      
      setCalculatedDose(dosageInfo);
      setFrequency(frequencyInfo);

      toast({
        title: t('toast.dosageCalculated'),
        description: t('toast.calculationCompleted'),
      });
    } catch (error: any) {
      setError("Calculation error occurred");
      toast({
        title: t('toast.calculationFailed'),
        description: t('toast.calculationError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [drugName, age, weight, toast]);









  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">{t('dosage.title')}</h1>
          <p className="text-muted-foreground">{t('dosage.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{t('dosage.patientInfo')}</h2>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="drugName">{t('dosage.drugName')}</Label>
                <Input
                  id="drugName"
                  placeholder={t('dosage.drugNamePlaceholder')}
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">{t('dosage.age')}</Label>
                  <Input
                    id="age"
                    placeholder={t('dosage.agePlaceholder')}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">{t('dosage.weight')}</Label>
                  <Input
                    id="weight"
                    placeholder={t('dosage.weightPlaceholder')}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>{t('dosage.specialCategories')}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('dosage.selectApplicable')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pediatric">{t('dosage.pediatric')}</SelectItem>
                    <SelectItem value="geriatric">{t('dosage.geriatric')}</SelectItem>
                    <SelectItem value="pregnancy">{t('dosage.pregnancy')}</SelectItem>
                    <SelectItem value="renal">{t('dosage.renal')}</SelectItem>
                    <SelectItem value="hepatic">{t('dosage.hepatic')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => handleCalculate()}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                <Calculator className="w-5 h-5 mr-2" />
                {loading ? t('dosage.calculating') : t('dosage.calculate')}
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">{t('dosage.calculatedDosage')}</h2>

            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t('dosage.dosage')}</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-lg font-semibold whitespace-pre-line">
                    {calculatedDose || t('dosage.enterInfo')}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">{t('dosage.frequency')}</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-lg font-semibold whitespace-pre-line">
                    {frequency || t('dosage.frequencyAppear')}
                  </p>
                </div>
              </div>

              {calculatedDose && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">{t('dosage.importantNotes')}</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>{t('dosage.consultProfessional')}</li>
                    <li>{t('dosage.considerFactors')}</li>
                    <li>{t('dosage.monitorEffects')}</li>
                  </ul>
                </div>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-100 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">{t('dosage.error')}</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}


