import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Sprout } from "lucide-react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { cropOptions } from "@/constants/cropOtions";
import InputField from "@/app/components/onboarding/InputField";

const FarmInfoStep = () => {
  const { data, updateData } = useOnboardingStore();
  const { farmInfo } = data;

  const [focused, setFocused] = useState<string | null>(null);

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

    updateData({ farmInfo: { cropTypes: current } });
  };

  return (
    <ScrollView
      className="flex-1 px-6 pt-4"
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Farm Name */}
      <InputField
        label="Farm Name"
        placeholder="ie. Kwame Mintah Farms"
        icon="leaf"
        value={farmInfo?.farmName || ""}
        onChange={(text) => updateData({ farmInfo: { farmName: text } })}
        required
        focused={focused}
        setFocused={setFocused}
        fieldKey="farmName"
      />

      {/* Farm Size (in acres only) */}
      <View className="mt-4">
        <InputField
          label="Farm Size"
          placeholder="1.2"
          icon="ruler"
          value={farmInfo?.farmSize?.toString() || ""}
          onChange={(text) => {
            const parsed = parseFloat(text);
            updateData({
              farmInfo: { farmSize: isNaN(parsed) ? undefined : parsed },
            });
          }}
          keyboardType="numeric"
          focused={focused}
          setFocused={setFocused}
          fieldKey="farmSize"
          required
        />
        {/* Fixed Unit Label */}
        <Text className="absolute text-gray-500 bottom-10 right-3">Acre</Text>
      </View>

      {/* Crop Types */}
      <View className="mt-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Crop Type
        </Text>
        <View className="flex-row flex-wrap">
          {cropOptions.map((crop) => {
            const selected = farmInfo?.cropTypes?.includes(crop);
            return (
              <TouchableOpacity
                key={crop}
                onPress={() => toggleCrop(crop)}
                className={`flex-row items-center px-4 py-2 mr-2 mb-2 rounded-full border ${
                  selected
                    ? "bg-green-100 border-green-600"
                    : "bg-white border-gray-300"
                }`}
              >
                <Sprout
                  size={14}
                  className={`mr-1 ${
                    selected ? "text-green-700" : "text-gray-400"
                  }`}
                />
                <Text
                  className={`text-sm ${
                    selected ? "text-green-800 font-semibold" : "text-gray-700"
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
