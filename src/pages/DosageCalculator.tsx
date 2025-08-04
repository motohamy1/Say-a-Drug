import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Calculator, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function DosageCalculator() {
  const [drugName, setDrugName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [category, setCategory] = useState("");
  const [calculatedDose, setCalculatedDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const { toast } = useToast();

  const handleCalculate = () => {
    if (!drugName || !age || !weight) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Mock calculation - in real app, this would call an AI service
    const mockDose = `${Math.round(parseFloat(weight) * 0.5)} mg`;
    const mockFrequency = "Every 8 hours";
    
    setCalculatedDose(mockDose);
    setFrequency(mockFrequency);
    
    toast({
      title: "Dosage Calculated",
      description: "AI-powered calculation completed successfully",
    });
  };

  // const handleVoiceInput = () => {
  //   if (isListening) {
  //     stopListening();
  //   } else {
  //     startListening();
  //   }
  // };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Dosage Calculator</h1>
          <p className="text-muted-foreground">
            AI-powered medication dosage calculations with mira's assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Patient Information</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  
                >
                  
                    <>
                      <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                      Listening...
                    </>
                  
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Voice Input
                    </>
                  
                </Button>
                
                
                  <Button 
                    variant="outline" 
                    size="sm"
                    
                  >
                    <VolumeX className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="drugName">Drug Name</Label>
                <Input
                  id="drugName"
                  placeholder="Enter drug name"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    placeholder="Enter age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Special Categories</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select if applicable" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pediatric">Pediatric</SelectItem>
                    <SelectItem value="geriatric">Geriatric</SelectItem>
                    <SelectItem value="pregnancy">Pregnancy</SelectItem>
                    <SelectItem value="renal">Renal Impairment</SelectItem>
                    <SelectItem value="hepatic">Hepatic Impairment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCalculate} 
                className="w-full"
                size="lg"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Dosage
              </Button>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Calculated Dosage</h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Dosage</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">
                    {calculatedDose || "Enter information to calculate"}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Frequency</Label>
                <div className="mt-2 p-4 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">
                    {frequency || "Dosage frequency will appear here"}
                  </p>
                </div>
              </div>

              {calculatedDose && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-semibold text-sm mb-2">Important Notes:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• This is an AI-generated suggestion</li>
                    <li>• Always consult a healthcare professional</li>
                    <li>• Consider patient-specific factors</li>
                    <li>• Monitor for side effects</li>
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}