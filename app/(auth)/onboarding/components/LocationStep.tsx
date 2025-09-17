import React, { useState } from "react";
import { View } from "react-native";
import { MapPin } from "lucide-react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import SelectModal from "@/app/components/general/SelectModal";
import InputBox from "@/app/components/general/InputBox";
import {
  getAllRegions,
  getDistrictsByRegion,
} from "@/constants/ghana-regions-districts";

export default function LocationStep() {
  const { data, updateData } = useOnboardingStore();
  const [regionModal, setRegionModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);

  const regions = getAllRegions().map((r) => ({
    label: r,
    value: r,
    icon: <MapPin size={18} color="#4B5563" />,
  }));

  const districts = data.location.region
    ? getDistrictsByRegion(data.location.region).map((d) => ({
        label: d,
        value: d,
        icon: <MapPin size={18} color="#4B5563" />,
      }))
    : [];

  return (
    <View className="space-y-6">
      <InputBox
        label="Region"
        value={data.location.region}
        placeholder="Select Region"
        onPress={() => setRegionModal(true)}
      />

      <InputBox
        label="District"
        value={data.location.district}
        placeholder="Select District"
        onPress={() => setDistrictModal(true)}
        disabled={!data.location.region}
      />

      {/* Region Modal */}
      <SelectModal
        visible={regionModal}
        title="Select Region"
        options={regions}
        onSelect={(val) => {
          updateData({ location: { region: val, district: "" } });
          setRegionModal(false);
        }}
        onClose={() => setRegionModal(false)}
      />

      {/* District Modal */}
      <SelectModal
        visible={districtModal}
        title="Select District"
        options={districts}
        onSelect={(val) => {
          updateData({ location: { district: val } });
          setDistrictModal(false);
        }}
        onClose={() => setDistrictModal(false)}
      />
    </View>
  );
}
