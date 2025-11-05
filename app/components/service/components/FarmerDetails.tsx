import React, { useReducer, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFarmerStore } from "@/stores/farmerStore";
import { ChevronDown, ChevronUp } from "lucide-react-native";

const { height } = Dimensions.get("window");

// ---------------- Reducer ----------------
const initialState = {
  selectedFarm: null,
  selectedCrop: null,
  startDate: new Date(),
  startTime: new Date(),
  endDate: new Date(),
  endTime: new Date(),
};

function reducer(state: any, action: any) {
  const { type, payload } = action;
  switch (type) {
    case "SET_FARM":
      return { ...state, selectedFarm: payload, selectedCrop: null };
    case "SET_CROP":
      return { ...state, selectedCrop: payload };
    default:
      return { ...state, [type]: payload };
  }
}

// ---------------- Dropdown ----------------
const Dropdown = ({
  label,
  value,
  placeholder,
  data,
  visible,
  onToggle,
  onSelect,
  disabled = false,
}: any) => (
  <View className="py-3 z-10 relative">
    <Text className="text-gray-700 font-medium mb-1">{label}:</Text>

    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`flex-row justify-between items-center border border-gray-300 rounded-lg px-3 py-3 ${
        disabled ? "bg-gray-100 opacity-70" : "bg-white"
      }`}
    >
      <Text className={value ? "text-gray-900 font-semibold" : "text-gray-400"}>
        {value || placeholder}
      </Text>
      {visible ? (
        <ChevronUp size={20} color={disabled ? "#9CA3AF" : "#4B5563"} />
      ) : (
        <ChevronDown size={20} color={disabled ? "#9CA3AF" : "#4B5563"} />
      )}
    </Pressable>

    {visible && data.length > 0 && (
      <View
        style={{ maxHeight: height * 0.3 }}
        className="absolute top-[72px] left-0 right-0 border border-gray-300 rounded-lg bg-white shadow-xl overflow-hidden"
      >
        <ScrollView contentContainerStyle={{ paddingVertical: 0 }}>
          {data.map((item: any, index: number) => (
            <Pressable
              key={(item.id || item) + index.toString()}
              className="p-3 border-b border-gray-100 active:bg-green-50"
              onPress={() => onSelect(item)}
            >
              <Text className="text-gray-800 font-medium">
                {label === "Farm" ? item.farmName : item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

// ---------------- Reusable Date/Time Row ----------------
const DateTimeRow = ({ label, value, type, onPress }: any) => (
  <Pressable
    onPress={() => onPress(type)}
    className="flex-row justify-between items-center border-b border-gray-100 py-3"
  >
    <Text className="text-gray-600 font-medium">{label}:</Text>
    <Text className="text-lg text-gray-800 font-semibold">
      {type.includes("Date")
        ? value.toDateString()
        : value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </Text>
  </Pressable>
);

// ---------------- Main ----------------
const FarmerDetails = ({ service }: any) => {
  const { farms } = useFarmerStore();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showPicker, setShowPicker] = useState<{
    type: null | "startDate" | "startTime" | "endDate" | "endTime";
  }>({ type: null });

  const onChange = (event: any, selectedDate?: Date) => {
    if (event.type === "dismissed") {
      setShowPicker({ type: null });
      return;
    }

    if (selectedDate && showPicker.type) {
      dispatch({
        type: `SET_${showPicker.type.toUpperCase()}`,
        payload: selectedDate,
      });
    }

    if (Platform.OS === "android") setShowPicker({ type: null });
  };

  const dateTimeFields = [
    { label: "Start Date", type: "startDate" },
    { label: "Start Time", type: "startTime" },
    { label: "End Date", type: "endDate" },
    { label: "End Time", type: "endTime" },
  ];

  return (
    <ScrollView className="flex-1 px-4 bg-white">
      {/* Title */}
      <Text className="text-green-700 font-extrabold text-3xl mt-6">
        {service?.title || "Service Details"}
      </Text>
      <Text className="text-gray-500 text-base mb-6">
        {service?.subtitle || "Please select your farm and crop below."}
      </Text>

      {/* Render Date & Time Fields */}
      {dateTimeFields.map((field) => (
        <DateTimeRow
          key={field.type}
          label={field.label}
          type={field.type}
          value={state[field.type as keyof typeof state]}
          onPress={(type: any) => setShowPicker({ type })}
        />
      ))}

      {/* Farm Dropdown */}
      <Dropdown
        label="Farm"
        value={state.selectedFarm?.farmName}
        placeholder="Select Farm"
        data={farms}
        visible={false} // (replace with controlled state if needed)
        onToggle={() => {}}
        onSelect={(farm: any) => dispatch({ type: "SET_FARM", payload: farm })}
      />

      {/* Crop Dropdown */}
      <Dropdown
        label="Crop"
        value={state.selectedCrop}
        placeholder="Select Crop"
        data={state.selectedFarm ? state.selectedFarm.cropTypes : []}
        visible={false}
        onToggle={() => {}}
        onSelect={(crop: string) =>
          dispatch({ type: "SET_CROP", payload: crop })
        }
        disabled={!state.selectedFarm}
      />

      {/* DateTimePicker */}
      {showPicker.type && (
        <DateTimePicker
          mode={showPicker.type.includes("Date") ? "date" : "time"}
          value={state[showPicker.type as keyof typeof state] as Date}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}

      <View className="h-40" />
    </ScrollView>
  );
};

export default FarmerDetails;
