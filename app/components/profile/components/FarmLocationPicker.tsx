import { toastError } from "@/lib/toast";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";

type Coords = { latitude: number; longitude: number };

type FarmLocationPickerProps = {
  value: Coords | null;
  onChange: (coords: Coords) => void;
};

const FarmLocationPicker = ({ value, onChange }: FarmLocationPickerProps) => {
  const [loading, setLoading] = useState(false);
  const [hasMapReady, setHasMapReady] = useState(false);

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

  if (!value) {
    return (
      <View className="mt-5 mb-4">
        <Text className="text-sm font-bold text-gray-800 mb-2 font-mulish">
          Farm Location (Optional)
        </Text>
        <TouchableOpacity
          onPress={fetchLocation}
          disabled={loading}
          activeOpacity={0.7}
          className="flex-row justify-center items-center py-3 border border-gray-200 rounded-xl bg-gray-50 shadow-sm"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#047857" />
          ) : (
            <>
              <Ionicons name="location-outline" size={20} color="#047857" />
              <Text className="text-teal-700 font-semibold ml-2">
                Set GPS Location
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const region: Region = {
    latitude: value.latitude,
    longitude: value.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

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
            <Ionicons name="refresh" size={16} color="#047857" />
          )}
          <Text className="text-teal-700 font-medium text-xs ml-1">Refetch</Text>
        </TouchableOpacity>
      </View>
      
      <View className="h-48 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative bg-gray-100">
        <MapView
          style={{ flex: 1 }}
          region={hasMapReady ? region : undefined}
          initialRegion={region}
          onMapReady={() => setHasMapReady(true)}
        >
          <Marker
            coordinate={value}
            draggable
            onDragEnd={(e) => onChange(e.nativeEvent.coordinate)}
          />
        </MapView>
        <View className="absolute bottom-2 left-0 right-0 items-center pointer-events-none">
          <View className="bg-black/60 px-3 py-1 rounded-full">
            <Text className="text-white text-xs">Drag pin to adjust</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default FarmLocationPicker;
