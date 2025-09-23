import React from "react";
import { View, Text } from "react-native";

interface FarmerDetailsProps {
  service: {
    title?: string;
    subtitle?: string;
  } | undefined;
  startDate?: string | string[];
  startTime?: string | string[];
  endDate?: string | string[];
  endTime?: string | string[];
}

const FarmerDetails: React.FC<FarmerDetailsProps> = ({
  service,
  startDate,
  startTime,
  endDate,
  endTime,
}) => {
  return (
    <View>
      {/* Title & Subtitle */}
      <Text className="text-[#00796B] font-bold text-2xl mt-4">
        {service?.title}
      </Text>
      <Text className="text-gray-600 text-base mb-3">
        {service?.subtitle}
      </Text>

      {/* Start Date & Time */}
      {startDate && startTime && (
        <Text className="text-lg text-gray-800 mb-2">
          Start: {new Date(startDate as string).toDateString()}{" "}
          {new Date(startTime as string).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}

      {/* End Date & Time */}
      {endDate && endTime && (
        <Text className="text-lg text-gray-800 mb-4">
          End: {new Date(endDate as string).toDateString()}{" "}
          {new Date(endTime as string).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
    </View>
  );
};

export default FarmerDetails;
