import { useFarmerStore } from "@/stores/farmerStore";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ChevronDown } from "lucide-react-native";
import React, { useEffect, useReducer, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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

// Dropdown Modal Component - uses Modal to avoid z-index issues
type DropdownModalProps = {
  visible: boolean;
  title: string;
  data: any[];
  onSelect: (item: any) => void;
  onClose: () => void;
  renderItem: (item: any) => string;
  emptyMessage: string;
};

const DropdownModal = ({
  visible,
  title,
  data,
  onSelect,
  onClose,
  renderItem,
  emptyMessage,
}: DropdownModalProps) => (
  <Modal visible={visible} transparent animationType="fade">
    <Pressable
      style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.3)" }}
      onPress={onClose}
    >
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20 }}>
        <Pressable
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            maxHeight: SCREEN_HEIGHT * 0.5,
            overflow: "hidden",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              {title}
            </Text>
          </View>

          {/* Options */}
          {data.length > 0 ? (
            <ScrollView style={{ maxHeight: SCREEN_HEIGHT * 0.4 }}>
              {data.map((item: any, index: number) => (
                <TouchableOpacity
                  key={(item.id || item) + index.toString()}
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F3F4F6",
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#374151" }}>
                    {renderItem(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#9CA3AF", fontSize: 14 }}>{emptyMessage}</Text>
            </View>
          )}

          {/* Cancel Button */}
          <TouchableOpacity
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: "#E5E7EB",
              alignItems: "center",
            }}
            onPress={onClose}
          >
            <Text style={{ fontSize: 16, color: "#059669", fontWeight: "600" }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Pressable>
      </View>
    </Pressable>
  </Modal>
);

// Dropdown Trigger Button
type DropdownButtonProps = {
  label: string;
  value: string | undefined;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
};

const DropdownButton = ({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
}: DropdownButtonProps) => (
  <View style={{ paddingVertical: 12 }}>
    <Text style={{ color: "#374151", fontWeight: "500", marginBottom: 4 }}>
      {label}:
    </Text>
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: disabled ? "#F3F4F6" : "#FFFFFF",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <Text
        style={{
          color: value ? "#111827" : "#9CA3AF",
          fontWeight: value ? "600" : "400",
          fontSize: 15,
        }}
      >
        {value || placeholder}
      </Text>
      <ChevronDown size={20} color={disabled ? "#9CA3AF" : "#4B5563"} />
    </TouchableOpacity>
  </View>
);

// Date/Time Row Component
type DateTimeRowProps = {
  label: string;
  value: Date;
  type: string;
  onPress: (type: string) => void;
};

const DateTimeRow = ({ label, value, type, onPress }: DateTimeRowProps) => (
  <TouchableOpacity
    onPress={() => onPress(type)}
    activeOpacity={0.7}
    style={{
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: "#F3F4F6",
      paddingVertical: 12,
    }}
  >
    <Text style={{ color: "#4B5563", fontWeight: "500" }}>{label}:</Text>
    <Text style={{ fontSize: 16, color: "#111827", fontWeight: "600" }}>
      {type.includes("Date")
        ? value.toDateString()
        : value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </Text>
  </TouchableOpacity>
);

// Main Component
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

  // Get store functions safely - they might be undefined if store hasn't initialized
  const serviceFlowStore = useServiceFlowStore();
  const setDraftFarm = serviceFlowStore?.setFarmId;
  const setDraftCrop = serviceFlowStore?.setCrop;

  // Modal visibility states
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

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
    if (state.selectedFarm?.id && typeof setDraftFarm === 'function') {
      setDraftFarm(state.selectedFarm.id);
    }
  }, [state.selectedFarm, setDraftFarm]);

  useEffect(() => {
    if (state.selectedCrop && typeof setDraftCrop === 'function') {
      setDraftCrop(state.selectedCrop);
    }
  }, [state.selectedCrop, setDraftCrop]);

  const handleFarmSelect = (farm: any) => {
    dispatch({ type: "SET_FARM", payload: farm });
  };

  const handleCropSelect = (crop: string) => {
    dispatch({ type: "SET_CROP", payload: crop });
  };

  const onChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed") {
      setShowPicker({ type: null });
      return;
    }

    if (selectedDate && showPicker.type) {
      const actionType = `SET_${showPicker.type.toUpperCase()}` as Action["type"];
      dispatch({ type: actionType, payload: selectedDate } as Action);
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

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: "#FFFFFF" }}>
      {/* Service Title */}
      <Text
        style={{
          color: "#047857",
          fontWeight: "800",
          fontSize: 28,
          marginTop: 24,
        }}
      >
        {service?.title || "Service Details"}
      </Text>
      <Text style={{ color: "#6B7280", fontSize: 14, marginBottom: 24 }}>
        {service?.subtitle || "Please select your farm and crop below."}
      </Text>

      {/* Date/Time Fields */}
      {dateTimeFields.map((field) => (
        <DateTimeRow
          key={field.type}
          label={field.label}
          type={field.type}
          value={state[field.type]}
          onPress={(type: any) => setShowPicker({ type })}
        />
      ))}

      {/* Farm Dropdown */}
      <DropdownButton
        label="Farm"
        value={state.selectedFarm?.farmName}
        placeholder="Select Farm"
        onPress={() => setShowFarmModal(true)}
      />

      {/* Crop Dropdown */}
      <DropdownButton
        label="Crop"
        value={state.selectedCrop ?? undefined}
        placeholder="Select Crop"
        onPress={() => setShowCropModal(true)}
        disabled={!state.selectedFarm}
      />

      {/* Farm Selection Modal */}
      <DropdownModal
        visible={showFarmModal}
        title="Select Farm"
        data={farms}
        onSelect={handleFarmSelect}
        onClose={() => setShowFarmModal(false)}
        renderItem={(farm) => farm.farmName}
        emptyMessage="No farms available. Add a farm in your profile."
      />

      {/* Crop Selection Modal */}
      <DropdownModal
        visible={showCropModal}
        title="Select Crop"
        data={state.selectedFarm?.cropTypes ?? []}
        onSelect={handleCropSelect}
        onClose={() => setShowCropModal(false)}
        renderItem={(crop) => crop}
        emptyMessage="No crops available for this farm."
      />

      {/* Date/Time Picker */}
      {showPicker.type && (
        <DateTimePicker
          mode={showPicker.type.includes("Date") ? "date" : "time"}
          value={state[showPicker.type]}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default FarmerDetails;
