import PickerModal from "@/app/components/general/PickerModal";
import { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { CircleX } from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ServiceDateTimePickerProps {
    heading: string;
    subtext: string;
    heroImage?: any; // <- New prop for dynamic image
    onCancel?: () => void;
    onConfirm: (date: Date, time: Date) => void;
    initialDate?: Date;
    initialTime?: Date;
  }
  

const ServiceDateTimePicker: React.FC<ServiceDateTimePickerProps> = ({
  heading,
  subtext,
  heroImage,
  onCancel,
  onConfirm,
  initialDate,
  initialTime,
}) => {
  const router = useRouter();

  const [date, setDate] = useState(initialDate || new Date());
  const [time, setTime] = useState(initialTime || new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<Date>>, close: () => void) =>
    (event: DateTimePickerEvent, selected?: Date) => {
      // On iOS the `event.type` may be undefined but `selected` will be provided.
      // Accept any provided `selected` value (safe) and only rely on `event.type`
      // for Android dismissal behaviour.
      if (selected) setter(selected);
      // On Android we need to explicitly close the native picker after selection/dismiss
      if (Platform.OS === "android") close();
    };

  const handleNext = () => {
    onConfirm(date, time);
  };

  // Responsive sizing
  const buttonWidth = SCREEN_WIDTH * 0.85;
  const headingFontSize = SCREEN_WIDTH * 0.07;
  const subFontSize = SCREEN_WIDTH * 0.045;
  const btnFontSize = SCREEN_WIDTH * 0.05;
  const cancelFontSize = SCREEN_WIDTH * 0.045;
  const heroHeight = SCREEN_HEIGHT * 0.3;

  return (
    <View className="flex-1 bg-yellow-100">
      {/* Hero Image as background */}
      <View
        style={{
          width: SCREEN_WIDTH,
          height: heroHeight,
          position: "relative",
        }}
      >
        <Image
          source={heroImage}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      {/* White content card overlapping hero */}
      <View
        className="flex-1 bg-white rounded-t-3xl -mt-10 items-center pt-6 px-4"
        style={{ minHeight: SCREEN_HEIGHT - heroHeight + 40 }}
      >
        {/* Cancel */}
        <View className="px-4 py-4 m-4 bg-red-200 w-[70%] rounded-xl flex-row justify-center">
          <TouchableOpacity
            className="flex-row gap-2 justify-center items-center"
            onPress={onCancel || (() => router.back())}
          >
            <CircleX color="#FF0000" />
            <Text
              style={{ fontSize: cancelFontSize }}
              className="text-red-500 font-semibold"
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{ fontSize: headingFontSize }}
          className="text-center font-bold mt-2"
        >
          {heading}
        </Text>
        <Text
          style={{ fontSize: subFontSize }}
          className="text-gray-500 text-center mt-2"
        >
          {subtext}
        </Text>

        {/* Date & Time Pickers */}
        <View className="items-center mt-6">
          <TouchableOpacity
            style={{ width: buttonWidth }}
            className="border border-gray-300 p-4 rounded-2xl shadow-sm bg-white"
            onPress={() => setShowDate(true)}
          >
            <Text
              style={{ fontSize: btnFontSize }}
              className="text-gray-700 text-center"
            >
              {date.toDateString()}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ width: buttonWidth }}
            className="mt-4 border border-gray-300 p-4 rounded-2xl shadow-sm bg-white"
            onPress={() => setShowTime(true)}
          >
            <Text
              style={{ fontSize: btnFontSize }}
              className="text-gray-700 text-center"
            >
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Confirm button */}
        <View className="w-full px-6 mt-8 mb-6">
          <TouchableOpacity
            onPress={handleNext}
            className="bg-green-700 py-4 rounded-xl shadow-lg"
          >
            <Text
              style={{ fontSize: btnFontSize }}
              className="text-white text-center font-semibold"
            >
              Confirm
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

export default ServiceDateTimePicker;
