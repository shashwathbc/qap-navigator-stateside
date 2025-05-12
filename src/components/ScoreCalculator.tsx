import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/Spinner";

interface ScoreCalculatorProps {
  selectedState: string;
  location: { lat: number; lon: number } | null;
  onScoreCalculated: (score: number, amenities: any[]) => void;
}

interface ScoringCategory {
  category: string;
  texasMax: number;
  californiaMax: number;
  description: string;
  dataAvailable: boolean;
}

// QAP Scoring table data
const scoringData: ScoringCategory[] = [
  {
    category: "Financial Feasibility and Cost of Development",
    texasMax: 14,
    californiaMax: 12,
    description: "Points awarded based on cost per square foot and financial feasibility of the development.",
    dataAvailable: false
  },
  {
    category: "Development Location",
    texasMax: 17,
    californiaMax: 15,
    description: "Points for developments in areas with high opportunity indices, proximity to amenities, and underserved areas.",
    dataAvailable: true
  },
  {
    category: "Tenant Populations with Special Needs",
    texasMax: 5,
    californiaMax: 5,
    description: "Incentivizes support for individuals with disabilities or homelessness.",
    dataAvailable: false
  },
  {
    category: "Income and Rent Levels of Tenants",
    texasMax: 16,
    californiaMax: 10,
    description: "Encourages deeper income targeting and reduced rents.",
    dataAvailable: false
  },
  {
    category: "Size and Quality of Units",
    texasMax: 7,
    californiaMax: 8,
    description: "Rewards for larger unit sizes and inclusion of amenities.",
    dataAvailable: false
  },
  {
    category: "Tenant Services",
    texasMax: 10,
    californiaMax: 6,
    description: "Points for providing supportive services like education, health, etc.",
    dataAvailable: false
  },
  {
    category: "Readiness to Proceed",
    texasMax: 10,
    californiaMax: 5,
    description: "Scores readiness for construction start.",
    dataAvailable: false
  },
  {
    category: "Development Team Experience",
    texasMax: 10,
    californiaMax: 4,
    description: "Considers the team's history with successful LIHTC projects.",
    dataAvailable: false
  },
  {
    category: "State Housing Priorities",
    texasMax: 10,
    californiaMax: 12,
    description: "Rewards alignment with state-specific goals (e.g., rural housing, preservation).",
    dataAvailable: false
  },
  {
    category: "Eviction Prevention Plans",
    texasMax: 5,
    californiaMax: 4,
    description: "Incentivizes structured eviction prevention with case management.",
    dataAvailable: false
  }
];

const amenityTypes = [
  { type: "hospital", name: "Hospitals" },
  { type: "school", name: "Schools" },
  { type: "supermarket", name: "Grocery Stores" },
  { type: "restaurant", name: "Restaurants" },
  { type: "bus_station", name: "Public Transportation" }
];

const ScoreCalculator = ({ selectedState, location, onScoreCalculated }: ScoreCalculatorProps) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [locationScore, setLocationScore] = useState<number | null>(null);
  const [nearbyAmenities, setNearbyAmenities] = useState<any[]>([]);
  
  const maxPoints = selectedState === "Texas" 
    ? scoringData.reduce((sum, item) => sum + item.texasMax, 0)
    : selectedState === "California"
      ? scoringData.reduce((sum, item) => sum + item.californiaMax, 0)
      : 0;
  
  const developmentLocationMaxPoints = selectedState === "Texas" 
    ? 17 // Max points for Development Location in Texas
    : selectedState === "California"
      ? 15 // Max points for Development Location in California
      : 0;
  
  // Mock function to simulate fetching amenities from OpenStreetMap
  const fetchNearbyAmenities = async () => {
    if (!location) return [];
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random amenities based on location for demo purposes
    // In a real app, this would call the Overpass API or a geocoding service
    const amenities: any[] = [];
    
    amenityTypes.forEach(amenityType => {
      // Generate 0-3 amenities of each type
      const count = Math.floor(Math.random() * 4);
      
      for (let i = 0; i < count; i++) {
        // Generate a nearby point (within ~1-2km)
        const latOffset = (Math.random() - 0.5) * 0.02;
        const lonOffset = (Math.random() - 0.5) * 0.02;
        
        amenities.push({
          id: `${amenityType.type}-${i}`,
          type: amenityType.type,
          name: `${amenityType.name.slice(0, -1)} ${i + 1}`,
          lat: location.lat + latOffset,
          lon: location.lon + lonOffset,
          distance: Math.round(Math.sqrt(latOffset * latOffset + lonOffset * lonOffset) * 111 * 10) / 10
        });
      }
    });
    
    return amenities;
  };
  
  // Calculate Development Location score based on amenities
  const calculateLocationScore = (amenities: any[]) => {
    if (amenities.length === 0) return 0;
    
    // Count amenities by type
    const amenityCounts = amenityTypes.map(type => {
      return {
        type: type.type,
        count: amenities.filter(a => a.type === type.type).length
      };
    });
    
    // Calculate score based on variety and count of amenities
    const variety = amenityCounts.filter(a => a.count > 0).length;
    const totalCount = amenities.length;
    
    // Score based on variety (0-5 points) and total count (0-5 points)
    const varietyScore = (variety / amenityTypes.length) * 5;
    const countScore = Math.min(totalCount / 10, 1) * 5;
    
    // Proximity bonus (0-3 points)
    // Calculate average distance of the 3 closest amenities
    const proximityScore = amenities.length >= 3 
      ? (1 - Math.min(amenities.sort((a, b) => a.distance - b.distance).slice(0, 3).reduce((sum, a) => sum + a.distance, 0) / 3 / 5, 1)) * 3 
      : 0;
    
    // Sum scores and normalize to max points for the state
    const rawScore = varietyScore + countScore + proximityScore;
    const maxRawScore = 13; // Max possible raw score
    const normalizedScore = (rawScore / maxRawScore) * developmentLocationMaxPoints;
    
    return Math.min(normalizedScore, developmentLocationMaxPoints);
  };
  
  const calculateTotalScore = () => {
    if (!selectedState || !locationScore) return 0;
    
    // For this demo, we're only calculating the Development Location score
    // Other categories would be 0 since their data is not available via OSM
    
    // Calculate percentage of max points
    return (locationScore / maxPoints) * 100;
  };
  
  const handleCalculateScore = async () => {
    if (!selectedState || !location) return;
    
    setIsCalculating(true);
    
    try {
      const amenities = await fetchNearbyAmenities();
      setNearbyAmenities(amenities);
      
      const locScore = calculateLocationScore(amenities);
      setLocationScore(locScore);
      
      const totalPercentage = (locScore / maxPoints) * 100;
      onScoreCalculated(totalPercentage, amenities);
    } catch (error) {
      console.error("Error calculating score:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-4">
      {!selectedState ? (
        <div className="text-center p-6 text-muted-foreground">
          Please select a state to view QAP scoring criteria
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="font-medium">{selectedState} QAP Scoring Criteria</h3>
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Max Points</TableHead>
                    <TableHead className="hidden sm:table-cell">Data Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scoringData.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {selectedState === "Texas" ? item.texasMax : item.californiaMax}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {item.dataAvailable ? "OpenStreetMap" : "Not Available"}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="text-right font-medium">{maxPoints}</TableCell>
                    <TableCell className="hidden sm:table-cell"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          
          {location ? (
            <Button 
              onClick={handleCalculateScore} 
              className="w-full"
              disabled={isCalculating}
            >
              {isCalculating ? <Spinner /> : "Calculate QAP Score"}
            </Button>
          ) : (
            <Button disabled className="w-full">Set Location First</Button>
          )}
          
          {locationScore !== null && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h4 className="font-medium">Score Breakdown:</h4>
              <p>Development Location: {locationScore.toFixed(2)} points (based on {nearbyAmenities.length} nearby amenities)</p>
              <p className="font-semibold mt-2">
                Total Score: {calculateTotalScore().toFixed(2)}% of maximum points
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ScoreCalculator;
