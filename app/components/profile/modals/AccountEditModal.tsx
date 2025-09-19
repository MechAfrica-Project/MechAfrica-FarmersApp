// components/profile/modals/AccountEditModal.tsx
import PhoneInput from "@/app/(auth)/login/components/PhoneInput";
import InputField from "@/app/components/onboarding/InputField";
import { useOnboardingStore } from "@/stores/onboardingStore";
import DOBPicker from "../../onboarding/DOBSelect";
import GenderSelect from "../../onboarding/GenderSelector";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AccountEditModal = ({ visible, onClose }: Props) => {
  const { data, updateData } = useOnboardingStore();
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: call backend API here if needed
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 1200);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* semi-transparent backdrop */}
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <View className="absolute inset-0 bg-black/40" />
        </TouchableWithoutFeedback>

        {/* bottom sheet */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end"
        >
          <View className="w-full max-h-[70%] bg-white rounded-t-2xl px-4 pt-3 pb-6 shadow-2xl">
            <SafeAreaView className="h-full">
              {/* header */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-semibold text-gray-900">
                  Edit Account
                </Text>
                <TouchableOpacity onPress={onClose} className="px-2 py-1">
                  <Text className="text-sm text-gray-500">Cancel</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Full Name */}
                <InputField
                  label="Full Name"
                  placeholder="Enter your full name"
                  icon="user"
                  value={data.personalInfo?.name || ""}
                  onChange={(text) =>
                    updateData({
                      personalInfo: { ...data.personalInfo, name: text },
                    })
                  }
                  focused={focused}
                  setFocused={setFocused}
                  fieldKey="name"
                />

                {/* Other Names */}
                <InputField
                  label="Other Names"
                  placeholder="Enter other names"
                  icon="user"
                  value={data.personalInfo?.otherNames || ""}
                  onChange={(text) =>
                    updateData({
                      personalInfo: { ...data.personalInfo, otherNames: text },
                    })
                  }
                  focused={focused}
                  setFocused={setFocused}
                  fieldKey="otherNames"
                />

                {/* Phone Number */}
                <PhoneInput
                  label="Telephone number"
                  value={data.personalInfo?.phone}
                  onChange={(val) =>
                    updateData({
                      personalInfo: {
                        ...data.personalInfo,
                        phone: val,
                      },
                    })
                  }
                />

                {/* Gender */}
                <GenderSelect
                  label="Gender"
                  value={data.moreInfo?.gender}
                  onChange={(val) =>
                    updateData({ moreInfo: { ...data.moreInfo, gender: val } })
                  }
                />

                {/* DOB */}
                <DOBPicker />

                {/* Actions */}
                <View className="flex-row space-x-3 gap-8 mt-6">
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${
                      saving ? "bg-gray-400" : "bg-teal-700"
                    }`}
                  >
                    <Text className="text-white font-semibold">
                      {saving ? "Saving..." : "Save"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 border border-gray-300 py-3 rounded-xl items-center justify-center"
                  >
                    <Text className="text-gray-700 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </SafeAreaView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default AccountEditModal;
