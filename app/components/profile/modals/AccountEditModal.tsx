// components/profile/modals/AccountEditModal.tsx
import React from "react";
import { Text } from "react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import BottomSheetModal from "../../general/BottomSheetModal";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AccountEditModal = ({ visible, onClose }: Props) => {
  const { data } = useOnboardingStore();

  return (
    <BottomSheetModal visible={visible} onClose={onClose} title="Edit Account">
      <Text className="font-semibold">Name</Text>
      <Text>{data.personalInfo?.name || "N/A"}</Text>

      <Text className="mt-3 font-semibold">Other Names</Text>
      <Text>{data.personalInfo?.otherNames || "N/A"}</Text>

      <Text className="mt-3 font-semibold">Phone</Text>
      <Text>{data.personalInfo?.phone?.raw || "N/A"}</Text>

      <Text className="mt-3 font-semibold">Gender</Text>
      <Text>{data.moreInfo?.gender || "N/A"}</Text>

      <Text className="mt-3 font-semibold">Age</Text>
      <Text>{data.moreInfo?.age || "N/A"}</Text>

      <Text className="mt-3 font-semibold">Date of Birth</Text>
      <Text>{data.moreInfo?.dob || "N/A"}</Text>
    </BottomSheetModal>
  );
};

export default AccountEditModal;
