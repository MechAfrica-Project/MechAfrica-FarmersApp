import { View, Text } from "react-native";
import React from "react";
import { useOnboardingStore } from "@/stores/onboardingStore";

const Farms = () => {
  const { data } = useOnboardingStore();

  return (
    <View>
      {/* ✅ Farm Info */}
      <Text className="font-semibold mt-4">Farm Name:</Text>
      <Text>{data.farmInfo?.farmName || "N/A"}</Text>

      <Text className="font-semibold mt-2">Farm Size (acres):</Text>
      <Text>
        {data.farmInfo?.farmSize ? `${data.farmInfo.farmSize} acres` : "N/A"}
      </Text>

      <Text className="font-semibold mt-2">Crop Types:</Text>
      <Text>
        {data.farmInfo?.cropTypes?.length
          ? data.farmInfo.cropTypes.join(", ")
          : "N/A"}
      </Text>
    </View>
  );
};

export default Farms;
