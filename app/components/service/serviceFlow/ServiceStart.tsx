import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CircleX } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import PickerModal from "../../general/PickerModal";

const ServiceStart = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<Date>>, close: () => void) =>
    (event: DateTimePickerEvent, selected?: Date) => {
      if (event.type === "set" && selected) setter(selected);
      if (Platform.OS === "android") close(); // auto-close on Android
    };

  const handleNext = () => {
    // Combine date + time into one Date object
    const combinedStart = new Date(date);
    combinedStart.setHours(time.getHours(), time.getMinutes());

    router.push({
      pathname: "/components/service/serviceFlow/ServiceEnd",
      params: {
        id,
        startDate: combinedStart.toISOString(),
      },
    });
  };

  return (
    <View className="flex-1 bg-yellow-100">
      <View className="flex-1 mt-20 justify-center items-center rounded-t-xl bg-white">
        {/* Cancel */}
        <View className="px-4 py-4">
          <TouchableOpacity
            className="flex-row gap-2 justify-center items-center"
            onPress={() => router.back()}
          >
            <CircleX color="#FF0000" />
            <Text className="text-red-500 text-lg font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 items-center">
          <Text className="text-[2.3rem] w-[18rem] font-bold text-center mt-2">
            When you need this service?
          </Text>
          <Text className="text-gray-500 text-lg w-[17rem] text-center mt-5">
            Select the date and time you need the service.
          </Text>

          {/* Date button */}
          <TouchableOpacity
            className="mt-8 w-[20rem] border border-gray-300 p-4 rounded-lg"
            onPress={() => setShowDate(true)}
          >
            <Text className="text-lg text-gray-700 text-center">
              {date.toDateString()}
            </Text>
          </TouchableOpacity>

          {/* Time button */}
          <TouchableOpacity
            className="mt-4 w-[20rem] border border-gray-300 p-4 rounded-lg"
            onPress={() => setShowTime(true)}
          >
            <Text className="text-lg text-gray-700 text-center">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Choose button */}
        <View className="w-full px-6 mb-6">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-green-700 py-4 rounded-xl"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Choose
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modals */}
        <PickerModal
          visible={showDate}
          mode="date"
          value={date}
          onChange={handleChange(setDate, () => setShowDate(false))}
          onClose={() => setShowDate(false)}
        />
        <PickerModal
          visible={showTime}
          mode="time"
          value={time}
          onChange={handleChange(setTime, () => setShowTime(false))}
          onClose={() => setShowTime(false)}
        />
      </View>
    </View>
  );
};

export default ServiceStart;
