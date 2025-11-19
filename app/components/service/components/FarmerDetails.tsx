import { useFarmerStore } from "@/stores/farmerStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useReducer, useState } from "react";
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from "react-native";

const { height } = Dimensions.get("window");

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

const Dropdown = ({ label, value, placeholder, data, visible, onToggle, onSelect, disabled = false }: any) => (
  <View className="py-3 z-10 relative">
    <Text className="text-gray-700 font-medium mb-1">{label}:</Text>
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`flex-row justify-between items-center border border-gray-300 rounded-lg px-3 py-3 ${disabled ? "bg-gray-100 opacity-70" : "bg-white"}`}
    >
      <Text className={`${value ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
        {value || placeholder}
      </Text>
      {visible ? (
        <ChevronUp size={20} color={disabled ? "#9CA3AF" : "#4B5563"} />
      ) : (
        <ChevronDown size={20} color={disabled ? "#9CA3AF" : "#4B5563"} />
      )}
    </Pressable>

    {visible && data.length > 0 && (
      <View className="absolute top-[72px] left-0 right-0 border border-gray-300 rounded-lg bg-white shadow-xl" style={{ maxHeight: height * 0.3 }}>
        <ScrollView contentContainerStyle={{ paddingVertical: 0 }}>
          {data.map((item: any, index: number) => (
            <Pressable
              key={(item.id || item) + index.toString()}
              className="p-3 border-b border-gray-100 active:bg-green-50"
              onPress={() => onSelect(item)}
            >
              <Text className="text-gray-800 font-medium">{label === "Farm" ? item.farmName : item}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    )}
  </View>
);

const DateTimeRow = ({ label, value, type, onPress }: any) => (
  <Pressable onPress={() => onPress(type)} className="flex-row justify-between items-center border-b border-gray-100 py-3">
    <Text className="text-gray-600 font-medium">{label}:</Text>
    <Text className="text-lg text-gray-800 font-semibold">
      {type.includes("Date") ? value.toDateString() : value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </Text>
  </Pressable>
);

const FarmerDetails = ({ service, startDate, endDate, initialFarm, initialCrop }: any) => {
  const { farms } = useFarmerStore();
  const parseSafeDate = (s?: string) => {
    if (!s) return new Date();
    const d = new Date(s);
    if (isNaN(d.getTime()) || d.getTime() === 0) return new Date();
    return d;
  };

  const initialFromProps = {
    selectedFarm: initialFarm ?? null,
    selectedCrop: initialCrop ?? null,
    startDate: parseSafeDate(startDate),
    startTime: parseSafeDate(startDate),
    endDate: parseSafeDate(endDate),
    endTime: parseSafeDate(endDate),
  };

  const [state, dispatch] = useReducer(reducer, initialFromProps);
  const [showPicker, setShowPicker] = useState<{ type: null | "startDate" | "startTime" | "endDate" | "endTime" }>({ type: null });

  const onChange = (event: any, selectedDate?: Date) => {
    // On iOS `event.type` may be undefined — rely on `selectedDate` when provided.
    if (event?.type === "dismissed") return setShowPicker({ type: null });

    if (selectedDate && showPicker.type) {
      dispatch({ type: `SET_${showPicker.type.toUpperCase()}`, payload: selectedDate });
    }

    // Debug iOS picker events to help diagnose 'stuck' behaviour
    if (__DEV__ && Platform.OS === "ios") {
      try {
        // eslint-disable-next-line no-console
        console.debug("FarmerDetails:DateTimePicker:onChange", { event, selectedDate, showPicker });
      } catch (err) {}
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
      <Text className="text-green-700 font-extrabold text-3xl mt-6">{service?.title || "Service Details"}</Text>
      <Text className="text-gray-500 text-base mb-6">{service?.subtitle || "Please select your farm and crop below."}</Text>

      {dateTimeFields.map((field) => (
        <DateTimeRow
          key={field.type}
          label={field.label}
          type={field.type}
          value={state[field.type as keyof typeof state]}
          onPress={(type: any) => setShowPicker({ type })}
        />
      ))}

      <Dropdown
        label="Farm"
        value={state.selectedFarm?.farmName}
        placeholder="Select Farm"
        data={farms}
        visible={false}
        onToggle={() => {}}
        onSelect={(farm: any) => dispatch({ type: "SET_FARM", payload: farm })}
      />

      <Dropdown
        label="Crop"
        value={state.selectedCrop}
        placeholder="Select Crop"
        data={state.selectedFarm ? state.selectedFarm.cropTypes : []}
        visible={false}
        onToggle={() => {}}
        onSelect={(crop: string) => dispatch({ type: "SET_CROP", payload: crop })}
        disabled={!state.selectedFarm}
      />

      {showPicker.type && (
        <DateTimePicker
          mode={showPicker.type.includes("Date") ? "date" : "time"}
          value={state[showPicker.type as keyof typeof state] as Date}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}
    </ScrollView>
  );
};

export default FarmerDetails;
