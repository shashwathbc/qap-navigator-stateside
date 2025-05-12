
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define our schema for form validation
const locationSchema = z.object({
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  address: z.string().min(1, "Address is required")
});

type LocationData = z.infer<typeof locationSchema>;

// Mock data for cities and zip codes
const stateCityData = {
  "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth"],
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"]
};

const cityZipData = {
  // Texas cities
  "Houston": ["77001", "77002", "77003", "77004", "77005"],
  "Dallas": ["75201", "75202", "75203", "75204", "75205"],
  "Austin": ["78701", "78702", "78703", "78704", "78705"],
  "San Antonio": ["78201", "78202", "78203", "78204", "78205"],
  "Fort Worth": ["76101", "76102", "76103", "76104", "76105"],
  
  // California cities
  "Los Angeles": ["90001", "90002", "90003", "90004", "90005"],
  "San Francisco": ["94102", "94103", "94104", "94105", "94107"],
  "San Diego": ["92101", "92102", "92103", "92104", "92105"],
  "Sacramento": ["95811", "95812", "95813", "95814", "95815"],
  "San Jose": ["95101", "95102", "95103", "95106", "95109"]
};

interface LocationSelectorProps {
  onLocationChange: (state: string, city: string, zipCode: string, address: string) => void;
}

const LocationSelector = ({ onLocationChange }: LocationSelectorProps) => {
  const [cities, setCities] = useState<string[]>([]);
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  
  const form = useForm<LocationData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      state: "",
      city: "",
      zipCode: "",
      address: ""
    }
  });
  
  const { watch, setValue } = form;
  const selectedState = watch("state");
  const selectedCity = watch("city");
  
  // Update cities when state changes
  useEffect(() => {
    if (selectedState && stateCityData[selectedState as keyof typeof stateCityData]) {
      setCities(stateCityData[selectedState as keyof typeof stateCityData]);
      setValue("city", "");
      setValue("zipCode", "");
    } else {
      setCities([]);
    }
  }, [selectedState, setValue]);
  
  // Update zip codes when city changes
  useEffect(() => {
    if (selectedCity && cityZipData[selectedCity as keyof typeof cityZipData]) {
      setZipCodes(cityZipData[selectedCity as keyof typeof cityZipData]);
      setValue("zipCode", "");
    } else {
      setZipCodes([]);
    }
  }, [selectedCity, setValue]);
  
  const onSubmit = (data: LocationData) => {
    onLocationChange(data.state, data.city, data.zipCode, data.address);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={cities.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={zipCodes.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ZIP code" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zipCodes.map(zip => (
                    <SelectItem key={zip} value={zip}>
                      {zip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter full address (street, number)" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={!form.formState.isValid}
        >
          Set Location
        </Button>
      </form>
    </Form>
  );
};

export default LocationSelector;
