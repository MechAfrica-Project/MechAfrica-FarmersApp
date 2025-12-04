// components/profile/modals/AccountEditModal.tsx
import InputField from "@/app/components/onboarding/InputField";
import { Ionicons } from "@expo/vector-icons";
import { useFarmerStore } from "@/stores/farmerStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { toastSuccess } from "@/lib/toast";
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
  const updateProfile = useFarmerStore((state) => state.updateProfile);
  const [focused, setFocused] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Sync changes to backend and update farmerStore
      await updateProfile({
        personalInfo: data.personalInfo,
        moreInfo: data.moreInfo,
      });
      toastSuccess("Profile updated", "Your changes have been saved.");
      onClose();
    } catch (error) {
      // Error toast is shown by updateProfile
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
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
                {/* First Name */}
                <InputField
                  label="First Name"
                  placeholder="Enter your first name"
                  icon="user"
                  value={data.personalInfo?.firstName || ""}
                  onChange={(text) =>
                    updateData({
                      personalInfo: { ...data.personalInfo, firstName: text },
                    })
                  }
                  focused={focused}
                  setFocused={setFocused}
                  fieldKey="firstName"
                />

                {/* Last Name */}
                <InputField
                  label="Last Name"
                  placeholder="Enter your last name"
                  icon="user"
                  value={data.personalInfo?.lastName || ""}
                  onChange={(text) =>
                    updateData({
                      personalInfo: { ...data.personalInfo, lastName: text },
                    })
                  }
                  focused={focused}
                  setFocused={setFocused}
                  fieldKey="lastName"
                />

                {/* Other Names */}
                <InputField
                  label="Other Names"
                  placeholder="Enter other names (optional)"
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

                {/* Phone Number - Read Only (tied to authentication) */}
                <View className="mb-4">
                  <Text className="mb-2 font-mulish">Telephone number</Text>
                  <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-lg px-3 py-3">
                    <Ionicons name="call-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <Text className="text-base text-gray-600 flex-1">
                      {data.personalInfo?.phone?.formatted ||
                        data.personalInfo?.phone?.raw ||
                        "No phone number"}
                    </Text>
                    <Ionicons name="lock-closed-outline" size={14} color="#9CA3AF" />
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">
                    Phone number cannot be changed as it is linked to your account
                  </Text>
                </View>

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
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${saving ? "bg-gray-400" : "bg-teal-700"
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
