import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CircleX } from "lucide-react-native";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import PickerModal from "../general/PickerModal";

const ServiceEnd = () => {
  const router = useRouter();
  const { id, startDate, startTime } = useLocalSearchParams();

  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<Date>>) =>
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === "set" && selected) setter(selected);
    };

  const handleConfirm = () => {
    router.push({
      pathname: "/components/service/ServiceDetails",
      params: {
        id,
        startDate,
        startTime,
        endDate: endDate.toISOString(),
        endTime: endTime.toISOString(),
      },
    });
  };

  return (
    <View className="flex-1 mt-20 justify-center items-center rounded-t-xl bg-white">
      {/* Cancel */}
      <View className="px-4 py-4">
        <TouchableOpacity
          className="flex-row gap-2 justify-center items-center"
          onPress={() => router.push({
            pathname:"/(tabs)/services"
          })}
        >
          <CircleX color="#FF0000" className="w-3 h-3" />
          <Text className="text-red-500 text-lg font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-[2.3rem] w-[18rem] font-bold text-center mt-2">
          When should this service end?
        </Text>
        <Text className="text-gray-500 text-lg w-[17rem] text-center mt-5">
          Select the end date and time for the service.
        </Text>

        {/* Date button */}
        <TouchableOpacity
          className="mt-8 border border-gray-300 p-4 rounded-lg"
          onPress={() => setShowDate(true)}
        >
          <Text className="text-lg text-gray-700 text-center">
            {endDate.toDateString()}
          </Text>
        </TouchableOpacity>

        {/* Time button */}
        <TouchableOpacity
          className="mt-4 border border-gray-300 p-4 rounded-lg"
          onPress={() => setShowTime(true)}
        >
          <Text className="text-lg text-gray-700 text-center">
            {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirm button */}
      <View className="w-full px-6 mb-6">
        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-green-700 py-4 rounded-xl"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Confirm
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <PickerModal
        visible={showDate}
        mode="date"
        value={endDate}
        onChange={handleChange(setEndDate)}
        onClose={() => setShowDate(false)}
      />
      <PickerModal
        visible={showTime}
        mode="time"
        value={endTime}
        onChange={handleChange(setEndTime)}
        onClose={() => setShowTime(false)}
      />
    </View>
  );
};

export default ServiceEnd;
