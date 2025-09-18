import { View, Text, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useReducer, useRef, useCallback, useState } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Ionicons } from "@expo/vector-icons";

type Coords = { latitude: number; longitude: number };

type LocationState = {
  marker: Coords | null;
  city?: string;
};

type Action =
  | { type: "SET_MARKER"; payload: Coords }
  | { type: "SET_CITY"; payload: string };

const reducer = (state: LocationState, action: Action): LocationState => {
  switch (action.type) {
    case "SET_MARKER":
      return { ...state, marker: action.payload };
    case "SET_CITY":
      return { ...state, city: action.payload };
    default:
      return state;
  }
};

const DEFAULT_REGION: Region = {
  latitude: 5.6037, // Accra fallback
  longitude: -0.1870,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const FarmLocationStep = () => {
  const { data, updateData } = useOnboardingStore();
  const mapRef = useRef<MapView>(null);

  const [state, dispatch] = useReducer(reducer, {
    marker: data.farmLocation ?? null,
    city: undefined,
  });

  const [loading, setLoading] = useState(false);

  // 🔄 Sync marker to store
  useEffect(() => {
    if (state.marker) {
      updateData({ farmLocation: state.marker });
    }
  }, [state.marker, updateData]);

  // 📍 Load location
  const preloadLocation = useCallback(async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // balanced for speed
      });

      if (loc) {
        const coords: Coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        dispatch({ type: "SET_MARKER", payload: coords });

        // Animate instead of binding region to state
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              ...coords,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            1000
          );
        }

        // Reverse geocode city
        const places = await Location.reverseGeocodeAsync(coords);
        if (places.length > 0 && places[0].city) {
          dispatch({ type: "SET_CITY", payload: places[0].city });
        }
      }
    } catch (err) {
      console.error("Error getting location:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!data.farmLocation) {
      preloadLocation(); // preload on mount
    }
  }, []);

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Glow wrapper for map */}
      <View className="w-80 mt-4 h-80 rounded-full bg-yellow-100/40 items-center justify-center">
        <View className="w-72 h-72 rounded-full overflow-hidden">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={DEFAULT_REGION}
            provider="google"
          >
            {state.marker && (
              <Marker
                coordinate={state.marker}
                draggable
                onDragEnd={(e) =>
                  dispatch({
                    type: "SET_MARKER",
                    payload: e.nativeEvent.coordinate,
                  })
                }
              />
            )}
          </MapView>
          {loading && (
            <View className="absolute inset-0 items-center justify-center bg-white/40">
              <ActivityIndicator size="large" color="black" />
            </View>
          )}
        </View>
      </View>

      {/* City label */}
      {state.city && (
        <Text className="mt-3 text-gray-600">📍 {state.city}</Text>
      )}

      {/* Bottom button */}
      <TouchableOpacity
        onPress={preloadLocation}
        className="flex-row items-center mt-6 px-4 py-3 bg-black rounded-xl"
        disabled={loading}
      >
        <Ionicons name="locate-outline" size={20} color="white" />
        <Text className="text-white font-semibold ml-2">
          {loading ? "Fetching Location..." : "Use My Current Location"}
        </Text>
      </TouchableOpacity>

      {/* Floating recenter button */}
      <TouchableOpacity
        onPress={preloadLocation}
        className="absolute bottom-32 right-8 w-12 h-12 rounded-full bg-black items-center justify-center shadow-lg"
        disabled={loading}
      >
        <Ionicons name="locate-outline" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FarmLocationStep;
