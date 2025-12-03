import { useFarmerStore } from "@/stores/farmerStore";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useEffect, useReducer, useState } from "react";
import { Dimensions, Platform, Pressable, ScrollView, Text, View } from "react-native";

const { height } = Dimensions.get("window");

type State = {
  selectedFarm: any | null;
  selectedCrop: string | null;
  startDate: Date;
  startTime: Date;
  endDate: Date;
  endTime: Date;
};

type Action =
  | { type: "SET_FARM"; payload: any }
  | { type: "SET_CROP"; payload: string }
  | { type: "SET_STARTDATE"; payload: Date }
  | { type: "SET_STARTTIME"; payload: Date }
  | { type: "SET_ENDDATE"; payload: Date }
  | { type: "SET_ENDTIME"; payload: Date };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FARM":
      return { ...state, selectedFarm: action.payload, selectedCrop: null };
    case "SET_CROP":
      return { ...state, selectedCrop: action.payload };
    case "SET_STARTDATE":
      return { ...state, startDate: action.payload };
    case "SET_STARTTIME":
      return { ...state, startTime: action.payload };
    case "SET_ENDDATE":
      return { ...state, endDate: action.payload };
    case "SET_ENDTIME":
      return { ...state, endTime: action.payload };
    default:
      return state;
  }
}

type DropdownProps = {
  label: string;
  value: string | undefined;
  placeholder: string;
  data: any[];
  visible: boolean;
  onToggle: () => void;
  onSelect: (item: any) => void;
  disabled?: boolean;
  zIndex?: number;
};

const Dropdown = ({
  label,
  value,
  placeholder,
  data,
  visible,
  onToggle,
  onSelect,
  disabled = false,
  zIndex = 10,
}: DropdownProps) => (
  <View className="py-3 relative" style={{ zIndex }}>
    <Text className="text-gray-700 font-medium mb-1">{label}:</Text>
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className={`flex-row justify-between items-center border border-gray-300 rounded-lg px-3 py-3 ${disabled ? "bg-gray-100 opacity-70" : "bg-white"
        }`}
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
      <View
        className="absolute left-0 right-0 border border-gray-300 rounded-lg bg-white shadow-xl"
        style={{ top: 72, maxHeight: height * 0.3, zIndex: zIndex + 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingVertical: 0 }} nestedScrollEnabled>
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

    {visible && data.length === 0 && (
      <View
        className="absolute left-0 right-0 border border-gray-300 rounded-lg bg-white shadow-xl p-4"
        style={{ top: 72, zIndex: zIndex + 1 }}
      >
        <Text className="text-gray-500 text-center">
          {label === "Farm" ? "No farms available" : "No crops available"}
        </Text>
      </View>
    )}
  </View>
);

type DateTimeRowProps = {
  label: string;
  value: Date;
  type: string;
  onPress: (type: string) => void;
};

const DateTimeRow = ({ label, value, type, onPress }: DateTimeRowProps) => (
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

type FarmerDetailsProps = {
  service: any;
  startDate?: string;
  endDate?: string;
  initialFarm?: any;
  initialCrop?: string;
};

const FarmerDetails = ({
  service,
  startDate,
  endDate,
  initialFarm,
  initialCrop,
}: FarmerDetailsProps) => {
  const { farms } = useFarmerStore();
  const setDraftFarm = useServiceFlowStore((s) => s.setFarmId);
  const setDraftCrop = useServiceFlowStore((s) => s.setCrop);

  // Track which dropdown is currently open
  const [openDropdown, setOpenDropdown] = useState<"farm" | "crop" | null>(null);

  const parseSafeDate = (s?: string) => {
    if (!s) return new Date();
    const d = new Date(s);
    if (isNaN(d.getTime()) || d.getTime() === 0) return new Date();
    return d;
  };

  const initialState: State = {
    selectedFarm: initialFarm ?? (farms.length > 0 ? farms[0] : null),
    selectedCrop: initialCrop ?? null,
    startDate: parseSafeDate(startDate),
    startTime: parseSafeDate(startDate),
    endDate: parseSafeDate(endDate),
    endTime: parseSafeDate(endDate),
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const [showPicker, setShowPicker] = useState<{
    type: null | "startDate" | "startTime" | "endDate" | "endTime";
  }>({ type: null });

  // Sync selected farm/crop to service flow store
  useEffect(() => {
    if (state.selectedFarm?.id) {
      setDraftFarm(state.selectedFarm.id);
    }
  }, [state.selectedFarm, setDraftFarm]);

  useEffect(() => {
    if (state.selectedCrop) {
      setDraftCrop(state.selectedCrop);
    }
  }, [state.selectedCrop, setDraftCrop]);

  const handleFarmToggle = () => {
    setOpenDropdown(openDropdown === "farm" ? null : "farm");
  };

  const handleCropToggle = () => {
    if (!state.selectedFarm) return;
    setOpenDropdown(openDropdown === "crop" ? null : "crop");
  };

  const handleFarmSelect = (farm: any) => {
    dispatch({ type: "SET_FARM", payload: farm });
    setOpenDropdown(null);
  };

  const handleCropSelect = (crop: string) => {
    dispatch({ type: "SET_CROP", payload: crop });
    setOpenDropdown(null);
  };

  const onChange = (event: any, selectedDate?: Date) => {
    // On iOS `event.type` may be undefined — rely on `selectedDate` when provided.
    if (event?.type === "dismissed") {
      setShowPicker({ type: null });
      return;
    }

    if (selectedDate && showPicker.type) {
      const actionType = `SET_${showPicker.type.toUpperCase()}` as Action["type"];
      dispatch({ type: actionType, payload: selectedDate } as Action);
    }

    // Debug iOS picker events to help diagnose 'stuck' behaviour
    if (__DEV__ && Platform.OS === "ios") {
      try {
        console.debug("FarmerDetails:DateTimePicker:onChange", {
          event,
          selectedDate,
          showPicker,
        });
      } catch { }
    }

    if (Platform.OS === "android") {
      setShowPicker({ type: null });
    }
  };

  const dateTimeFields = [
    { label: "Start Date", type: "startDate" as const },
    { label: "Start Time", type: "startTime" as const },
    { label: "End Date", type: "endDate" as const },
    { label: "End Time", type: "endTime" as const },
  ];

  // Close dropdowns when tapping outside
  const handleContainerPress = () => {
    if (openDropdown) {
      setOpenDropdown(null);
    }
  };

  return (
    <Pressable onPress={handleContainerPress} className="flex-1">
      <ScrollView className="flex-1 px-4 bg-white" nestedScrollEnabled>
        <Text className="text-green-700 font-extrabold text-3xl mt-6">
          {service?.title || "Service Details"}
        </Text>
        <Text className="text-gray-500 text-base mb-6">
          {service?.subtitle || "Please select your farm and crop below."}
        </Text>

        {dateTimeFields.map((field) => (
          <DateTimeRow
            key={field.type}
            label={field.label}
            type={field.type}
            value={state[field.type]}
            onPress={(type: any) => {
              setOpenDropdown(null); // Close dropdowns when opening date picker
              setShowPicker({ type });
            }}
          />
        ))}

        {/* Farm Dropdown - higher z-index so it appears above crop dropdown */}
        <Dropdown
          label="Farm"
          value={state.selectedFarm?.farmName}
          placeholder="Select Farm"
          data={farms}
          visible={openDropdown === "farm"}
          onToggle={handleFarmToggle}
          onSelect={handleFarmSelect}
          zIndex={20}
        />

        {/* Crop Dropdown */}
        <Dropdown
          label="Crop"
          value={state.selectedCrop ?? undefined}
          placeholder="Select Crop"
          data={state.selectedFarm?.cropTypes ?? []}
          visible={openDropdown === "crop"}
          onToggle={handleCropToggle}
          onSelect={handleCropSelect}
          disabled={!state.selectedFarm}
          zIndex={10}
        />

        {showPicker.type && (
          <DateTimePicker
            mode={showPicker.type.includes("Date") ? "date" : "time"}
            value={state[showPicker.type]}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChange}
          />
        )}

        {/* Extra padding at bottom for scrolling */}
        <View className="h-20" />
      </ScrollView>
    </Pressable>
  );
};

export default FarmerDetails;
