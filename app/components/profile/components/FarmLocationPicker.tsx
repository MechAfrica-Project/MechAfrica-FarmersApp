import { toastError } from "@/lib/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Map } from "@/app/components/ui/map";

type Coords = { latitude: number; longitude: number };

type FarmLocationPickerProps = {
  value: Coords | null;
  onChange: (coords: Coords) => void;
  searchQuery?: string;
};

const FarmLocationPicker = ({ value, onChange, searchQuery }: FarmLocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [hasMapReady, setHasMapReady] = useState(false);

  // Auto geocode search query if provided and map hasn't been explicitly set yet
  React.useEffect(() => {
    if (searchQuery) {
      const geocode = async () => {
        try {
          const results = await Location.geocodeAsync(searchQuery);
          if (results.length > 0) {
            onChange({
              latitude: results[0].latitude,
              longitude: results[0].longitude,
            });
          }
        } catch (e) {
          console.warn("Geocoding failed for", searchQuery);
        }
      };
      geocode();
    }
  }, [searchQuery]);

  const fetchLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        toastError("Permission denied", "Location access is required.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (loc) {
        onChange({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }
    } catch (err) {
      console.error("Error getting location:", err);
      toastError("Error", "Could not fetch location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const center: [number, number] = value ? [value.longitude, value.latitude] : [-0.1870, 5.6037]; // Default to Accra if null

  return (
    <View className="mt-5 mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-bold text-gray-800 font-mulish">
          Farm Location
        </Text>
        <TouchableOpacity onPress={fetchLocation} disabled={loading} className="flex-row items-center">
          {loading ? (
            <ActivityIndicator size="small" color="#047857" />
          ) : (
            <Ionicons name="locate-outline" size={16} color="#047857" />
          )}
          <Text className="text-teal-700 font-medium text-xs ml-1">Use GPS</Text>
        </TouchableOpacity>
      </View>
      
      <View className="h-48 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100">
        <Map
          className="flex-1"
          center={center}
          zoom={14}
          onRegionDidChange={(coords) => {
            if (coords && coords.isUserInteraction) {
              onChange({
                longitude: coords.longitude,
                latitude: coords.latitude,
              });
            }
          }}
        />
        {/* Fixed Center Pin */}
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          <Ionicons name="location" size={40} color="#047857" style={{ marginTop: -20 }} />
        </View>
        <View className="absolute bottom-2 left-0 right-0 items-center pointer-events-none">
          <View className="bg-black/60 px-3 py-1 rounded-full">
            <Text className="text-white text-xs">Drag map to adjust pin</Text>
          </View>
        </View>
      </View>
      
      <View className="mt-2 flex-row justify-between items-center px-1">
        <Text className="text-xs text-gray-500 font-mono">
          Lat: {value ? value.latitude.toFixed(6) : "0.000000"}
        </Text>
        <Text className="text-xs text-gray-500 font-mono">
          Lng: {value ? value.longitude.toFixed(6) : "0.000000"}
        </Text>
      </View>
    </View>
  );
};

export default FarmLocationPicker;
