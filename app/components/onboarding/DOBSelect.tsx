import { useOnboardingStore } from "@/stores/onboardingStore";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar } from "lucide-react-native";
import React, { useEffect, useReducer } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";

type State = {
  dob: Date | null;
  age?: number;
  showPicker: boolean;
};

type Action =
  | { type: "setDob"; payload: Date }
  | { type: "setShowPicker"; payload: boolean };

const formatDOB = (date: Date) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const m = months[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  const suffix = d % 10 === 1 && d !== 11 ? 'st' : d % 10 === 2 && d !== 12 ? 'nd' : d % 10 === 3 && d !== 13 ? 'rd' : 'th';
  return `${m} ${d}${suffix}, ${y}`;
};

const DOBPicker = ({ label = "Date of Birth" }) => {
  const moreInfo = useOnboardingStore((state) => state.data.moreInfo);
  const updateData = useOnboardingStore((state) => state.updateData);

  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case "setDob":
        const dob = action.payload;
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const mMonth = today.getMonth() - dob.getMonth();
        if (mMonth < 0 || (mMonth === 0 && today.getDate() < dob.getDate())) age--;
        return { ...state, dob, age };
      case "setShowPicker":
        return { ...state, showPicker: action.payload };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    dob: moreInfo.dob ? new Date(moreInfo.dob) : null,
    age: moreInfo.age,
    showPicker: false,
  });

  useEffect(() => {
    const dobIso = state.dob?.toISOString();
    // Avoid redundant store updates which can cause render loops
    if (moreInfo.dob === dobIso && moreInfo.age === state.age) return;

    updateData({
      moreInfo: {
        ...moreInfo,
        dob: dobIso,
        age: state.age,
      },
    });
  }, [state.dob, state.age, moreInfo, updateData]);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    dispatch({ type: "setShowPicker", payload: Platform.OS === "ios" });
    if (event.type === "set" && selectedDate) {
      dispatch({ type: "setDob", payload: selectedDate });
    }
  };

  return (
    <View className="mb-6 ">
      <Text className="text-gray-700 font-semibold mb-2 text-base">{label}</Text>

      {/* Styled date box */}
      <TouchableOpacity
        className="flex-row items-center justify-between border border-gray-300 rounded-xl bg-white px-4 py-3 shadow-sm"
        onPress={() => dispatch({ type: "setShowPicker", payload: true })}
      >
        <Text className={`text-base ${state.dob ? "text-gray-800" : "text-gray-400"}`}>
          {state.dob
            ? formatDOB(state.dob) + ` (${state.age} yrs)`
            : "Select your date of birth"}
        </Text>
        <Calendar size={20} className="text-gray-400" />
      </TouchableOpacity>

      {/* Date Picker */}
      {state.showPicker && (
        <DateTimePicker
          value={state.dob || new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={new Date()}
          onChange={onChange}
          className="mt-3"
        />
      )}
    </View>
  );
};

export default DOBPicker;
