
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LocationSelector from "@/components/LocationSelector";
import ScoreCalculator from "@/components/ScoreCalculator";
import MapDisplay from "@/components/MapDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import ExportButton from "@/components/ExportButton";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedZipCode, setSelectedZipCode] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [location, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [scorePercentage, setScorePercentage] = useState<number | null>(null);
  const [amenitiesData, setAmenitiesData] = useState<any[]>([]);
  
  const handleLocationChange = (state: string, city: string, zip: string, addr: string) => {
    setSelectedState(state);
    setSelectedCity(city);
    setSelectedZipCode(zip);
    setAddress(addr);
    
    // This would normally geocode the address to get coordinates
    // For demo purposes, let's set some placeholder coordinates
    if (state === "Texas") {
      setLocation({ lat: 31.9686, lon: -99.9018 }); // Texas approximate center
    } else if (state === "California") {
      setLocation({ lat: 36.7783, lon: -119.4179 }); // California approximate center
    }
    
    // Reset score when location changes
    setScorePercentage(null);
    toast({
      title: "Location Updated",
      description: `Selected: ${addr}, ${city}, ${state}, ${zip}`,
    });
  };
  
  const onScoreCalculated = (score: number, amenities: any[]) => {
    setScorePercentage(score);
    setAmenitiesData(amenities);
    toast({
      title: "QAP Score Calculated",
      description: `Your location has a score of ${score.toFixed(2)}%`,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">LIHTC QAP Calculator</h1>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Location Selection</CardTitle>
                <CardDescription>Select the state, city, and enter address details</CardDescription>
              </CardHeader>
              <CardContent>
                <LocationSelector onLocationChange={handleLocationChange} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>QAP Score Calculator</CardTitle>
                <CardDescription>Calculate QAP score based on selected location</CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreCalculator 
                  selectedState={selectedState}
                  location={location}
                  onScoreCalculated={onScoreCalculated}
                />
              </CardContent>
              <CardFooter>
                {scorePercentage !== null && (
                  <div className="w-full">
                    <p className="text-lg font-semibold mb-2">
                      Your QAP Score: {scorePercentage.toFixed(2)}%
                    </p>
                    <ExportButton 
                      data={{
                        state: selectedState,
                        city: selectedCity,
                        zipCode: selectedZipCode,
                        address,
                        scorePercentage,
                        timestamp: new Date().toLocaleString(),
                        amenities: amenitiesData
                      }} 
                    />
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>
          
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>Interactive map showing your location and nearby amenities</CardDescription>
            </CardHeader>
            <CardContent className="p-0 h-[620px]">
              <MapDisplay 
                location={location}
                amenities={amenitiesData}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} LIHTC QAP Calculator | Developed for Texas & California
        </div>
      </footer>
    </div>
  );
};

export default Index;
