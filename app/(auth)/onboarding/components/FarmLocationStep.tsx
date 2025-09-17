// steps/FarmLocationStep.tsx
import { View, Text, Alert, TouchableOpacity } from "react-native";
import React, { useEffect, useReducer, useRef, useCallback } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { Ionicons } from "@expo/vector-icons";

type Coords = { latitude: number; longitude: number };

type LocationState = {
  region: Region | null;
  marker: Coords | null;
};

type Action =
  | { type: "SET_REGION"; payload: Region }
  | { type: "SET_MARKER"; payload: Coords };

const reducer = (state: LocationState, action: Action): LocationState => {
  switch (action.type) {
    case "SET_REGION":
      return { ...state, region: action.payload };
    case "SET_MARKER":
      return { ...state, marker: action.payload };
    default:
      return state;
  }
};

const FarmLocationStep = () => {
  const { data, updateData } = useOnboardingStore();

  const [state, dispatch] = useReducer(reducer, {
    region: null,
    marker: data.farmLocation ?? null,
  });

  const mapRef = useRef<MapView>(null);

  // 📍 Load saved location OR user’s current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        if (data.farmLocation) {
          const region: Region = {
            latitude: data.farmLocation.latitude,
            longitude: data.farmLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          };
          dispatch({ type: "SET_REGION", payload: region });
          dispatch({ type: "SET_MARKER", payload: data.farmLocation });
        } else {
          await fetchCurrentLocation();
        }
      } catch (err) {
        console.error("Error getting location:", err);
      }
    };

    getLocation();
  }, []);

  // 🔄 Sync marker to store
  useEffect(() => {
    if (state.marker) {
      updateData({ farmLocation: state.marker });
    }
  }, [state.marker, updateData]);

  // 📍 Helper to fetch current location
  const fetchCurrentLocation = useCallback(async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    console.log("Location permission status:", status);

    if (status !== "granted") {
      Alert.alert("Permission denied", "Location access is required.");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    const coords: Coords = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    const region: Region = {
      ...coords,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };

    dispatch({ type: "SET_REGION", payload: region });
    dispatch({ type: "SET_MARKER", payload: coords });

    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, []);

  if (!state.region) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base text-gray-500">Loading map...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-6">
      {/* Glow wrapper for map */}
      <View className="w-80 h-80 rounded-full bg-yellow-100/40 items-center justify-center">
        <View className="w-72 h-72 rounded-full overflow-hidden">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            region={state.region}
            provider="google"
            onRegionChangeComplete={(r) =>
              dispatch({ type: "SET_REGION", payload: r })
            }
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
        </View>
      </View>

      {/* Bottom button */}
      <TouchableOpacity
        onPress={fetchCurrentLocation}
        className="flex-row items-center mt-6 px-4 py-3 bg-black rounded-xl"
      >
        <Ionicons name="locate-outline" size={20} color="white" />
        <Text className="text-white font-semibold ml-2">
          Use My Current Location
        </Text>
      </TouchableOpacity>

      {/* Floating recenter button */}
      <TouchableOpacity
        onPress={fetchCurrentLocation}
        className="absolute bottom-32 right-8 w-12 h-12 rounded-full bg-black items-center justify-center shadow-lg"
      >
        <Ionicons name="locate-outline" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default FarmLocationStep;
