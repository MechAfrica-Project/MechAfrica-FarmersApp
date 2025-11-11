import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Sprout } from "lucide-react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import InputField from "@/app/components/onboarding/InputField";
import { cropOptions } from "@/constants/cropOptions";

const FarmInfoStep = () => {
  const { data, updateData } = useOnboardingStore();
  const { farmInfo } = data;

  const [focused, setFocused] = useState<string | null>(null);

  // Toggle crop selection logic
  const toggleCrop = (crop: string) => {
    let current = farmInfo?.cropTypes || [];

    if (crop === "All Crops") {
      if (current.includes("All Crops")) {
        updateData({ farmInfo: { cropTypes: [] } });
      } else {
        updateData({ farmInfo: { cropTypes: [...cropOptions] } });
      }
      return;
    }

    if (current.includes(crop)) {
      current = current.filter((c) => c !== crop);
    } else {
      current = [...current, crop];
    }

    if (current.includes("All Crops") && current.length < cropOptions.length) {
      current = current.filter((c) => c !== "All Crops");
    }

    if (
      current.length === cropOptions.length - 1 &&
      !current.includes("All Crops")
    ) {
      current = [...current, "All Crops"];
    }

    updateData({ farmInfo: { ...farmInfo, cropTypes: current } });
  };

  return (
    <ScrollView
      className="flex-1 px-6 pt-4 bg-white"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Farm Name */}
      <InputField
        label="Farm Name"
        placeholder="e.g. Kwame Mintah Farms"
        icon="leaf"
        value={farmInfo?.farmName || ""}
        onChange={(text) =>
          updateData({ farmInfo: { ...farmInfo, farmName: text } })
        }
        required
        focused={focused}
        setFocused={setFocused}
        fieldKey="farmName"
      />

      {/* Farm Size */}
      <View className="mt-5 relative">
        <InputField
          label="Farm Size"
          placeholder="1.2"
          icon="ruler"
          value={farmInfo?.farmSizeRaw ?? ""}
          onChange={(text) => {
            const parsed = parseFloat(text);
            updateData({
              farmInfo: {
                farmSizeRaw: text,
                farmSize: isNaN(parsed) ? undefined : parsed,
              },
            });
          }}
          keyboardType="decimal-pad"
          allowDecimal={true} 
          focused={focused}
          setFocused={setFocused}
          fieldKey="farmSize"
          required
        />

        <Text className="absolute right-3 bottom-10 text-gray-500 font-medium">
          Acre
        </Text>
      </View>

      {/* Crop Types */}
      <View className="mt-8">
        <Text className="text-base font-semibold text-gray-800 mb-3">
          Crop Type
        </Text>
        <View className="flex-row flex-wrap">
          {cropOptions.map((crop) => {
            const selected = farmInfo?.cropTypes?.includes(crop);
            return (
              <TouchableOpacity
                key={crop}
                onPress={() => toggleCrop(crop)}
                activeOpacity={0.8}
                className={`flex-row items-center px-4 py-2 mr-2 mb-2 rounded-full ${
                  selected ? "bg-green-700" : "bg-gray-100"
                }`}
              >
                <Sprout
                  size={14}
                  color={selected ? "#fff" : "#4B5563"} // Tailwind gray-600
                  className="mr-1"
                />
                <Text
                  className={`text-sm font-semibold ${
                    selected ? "text-white" : "text-gray-800"
                  }`}
                >
                  {crop}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default FarmInfoStep;
