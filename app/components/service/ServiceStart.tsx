import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";

const ServiceStart = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);

  const [time, setTime] = useState(new Date());
  const [showTime, setShowTime] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) {
      setDate(selectedDate);
      if (Platform.OS === "android") setShowDate(false);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    if (event.type === "set" && selectedTime) {
      setTime(selectedTime);
      if (Platform.OS === "android") setShowTime(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FDFFE0] justify-center items-center px-6">
      <Text className="text-2xl font-bold mb-6">Select Start Date & Time</Text>

      {/* Date */}
      <TouchableOpacity
        className="bg-[#00796B] px-6 py-3 rounded-full mb-4"
        onPress={() => setShowDate(true)}
      >
        <Text className="text-white font-semibold">
          {date.toDateString()}
        </Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker value={date} mode="date" display="spinner" onChange={onDateChange} />
      )}

      {/* Time */}
      <TouchableOpacity
        className="bg-[#00796B] px-6 py-3 rounded-full mb-6"
        onPress={() => setShowTime(true)}
      >
        <Text className="text-white font-semibold">
          {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </TouchableOpacity>
      {showTime && (
        <DateTimePicker value={time} mode="time" display="spinner" onChange={onTimeChange} />
      )}

      {/* Next */}
      <TouchableOpacity
        className="bg-[#00796B] px-6 py-3 rounded-full"
        onPress={() =>
          router.push({
            pathname: "/components/service/ServiceEnd",
            params: { id, startDate: date.toISOString(), startTime: time.toISOString() },
          })
        }
      >
        <Text className="text-white font-semibold">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ServiceStart;
