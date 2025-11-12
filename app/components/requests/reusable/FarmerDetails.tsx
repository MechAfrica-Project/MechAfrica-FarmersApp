import { formatDate } from "@/utils/formatDate";
import React from "react";
import { ScrollView, Text, View } from "react-native";

const FarmerDetails = ({ service }: any) => {
  // Define all display fields in a single array
  const details = [
    { label: "Service", value: service?.serviceTitle },
    { label: "Farmer's name", value: service?.farmerName },
    { label: "Preferred Date", value: formatDate(service?.startDateTime) },
    { label: "End Date", value: formatDate(service?.endDateTime) },
    { label: "Farm", value: service?.farmLocation },
    { label: "Crop", value: service?.crop },
  ];

  return (
    <ScrollView className="flex-1 px-6 bg-white mt-5">
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Farmer’s Details
      </Text>

      {/* Map through each detail row */}
      {details.map((item, index) => (
        <View
          key={index}
          className={`flex-row justify-between py-3 border-gray-200 ${
            index === 0 ? "border-t" : ""
          } ${index === details.length - 1 ? "border-b" : "border-t"}`}
        >
          <Text className="text-gray-600">{item.label}</Text>
          <Text className="text-gray-900 font-medium">
            {item.value || "N/A"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default FarmerDetails;
