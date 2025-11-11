import React, { useEffect, useReducer } from "react";
import { View } from "react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import GenderSelect from "@/app/components/onboarding/GenderSelector";
import DOBPicker from "@/app/components/onboarding/DOBSelect";

type State = {
  gender?: "Male" | "Female";
};

type Action = { type: "setGender"; payload: "Male" | "Female" };

const MoreInfoStep = () => {
  const moreInfo = useOnboardingStore((state) => state.data.moreInfo);
  const updateData = useOnboardingStore((state) => state.updateData);

  const [state, dispatch] = useReducer(
    (prev: State, action: Action): State => {
      switch (action.type) {
        case "setGender":
          return { ...prev, gender: action.payload };
        default:
          return prev;
      }
    },
    { gender: moreInfo.gender }
  );

  useEffect(() => {
    updateData({ moreInfo: { ...moreInfo, gender: state.gender } });
  }, [state.gender]);

  return (
    <View className="px-4 py-6 gap-4">
      <View className="mt-10"></View>

      {/* Gender Selector */}
      <GenderSelect
        label="Gender"
        value={state.gender}
        onChange={(value) => dispatch({ type: "setGender", payload: value })}
      />
      {/* Date of Birth Picker */}
      <DOBPicker />
    </View>
  );
};

export default MoreInfoStep;
