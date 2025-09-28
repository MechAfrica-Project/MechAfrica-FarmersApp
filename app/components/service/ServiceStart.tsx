import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CircleX } from "lucide-react-native";

const ServiceStart = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "set" && selectedTime) {
      setTime(selectedTime);
    }
  };

  const handleNext = () => {
    router.push({
      pathname: "/components/service/ServiceEnd",
      params: {
        id,
        startDate: date.toISOString(),
        startTime: time.toISOString(),
      },
    });
  };

  return (
    <View className="flex-1 mt-20 justify-center items-center rounded-t-xl bg-white">
      {/* Cancel */}
      <View className="px-4 py-4">
        <TouchableOpacity
          className="flex-row gap-2 justify-center items-center"
          onPress={() => router.back()}
        >
          <CircleX color="#FF0000" className="w-3 h-3" />{" "}
          <Text className="text-red-500 text-lg font-semibold">Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-[2.3rem] w-[18rem] font-bold text-center mt-2">
          When you need this service?
        </Text>
        <Text className="text-gray-500 text-lg w-[17rem] text-center mt-5">
          Select the date and time you need the service.
        </Text>

        {/* Date picker button */}
        <TouchableOpacity
          className="mt-8 border border-gray-300 p-4 rounded-lg"
          onPress={() => setShowDate(true)}
        >
          <Text className="text-lg w-full text-gray-700 text-center">
            {date.toDateString()}
          </Text>
        </TouchableOpacity>

        {/* Time picker button */}
        <TouchableOpacity
          className="mt-4 border border-gray-300 p-4 rounded-lg"
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

      {/* Date Modal */}
      <Modal visible={showDate} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white rounded-lg mx-6 p-4">
            <DateTimePicker
              value={date}
              mode="date"
              display="spinner"
              onChange={onDateChange}
            />
            <Pressable
              onPress={() => setShowDate(false)}
              className="mt-4 py-4 bg-green-700 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Time Modal */}
      <Modal visible={showTime} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white rounded-lg mx-6 p-4">
            <DateTimePicker
              value={time}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
            />
            <Pressable
              onPress={() => setShowTime(false)}
              className="mt-4 py-4 bg-green-700 rounded-lg"
            >
              <Text className="text-white text-center font-semibold">Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ServiceStart;
