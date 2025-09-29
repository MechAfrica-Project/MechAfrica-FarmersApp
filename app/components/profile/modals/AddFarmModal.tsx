import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MapPin, Sprout } from "lucide-react-native";
import { cropOptions } from "@/constants/cropOptions";
import {
  getAllRegions,
  getDistrictsByRegion,
} from "@/constants/ghana-regions-districts";
import { useFarmerStore } from "@/stores/farmerStore";
import SelectModal from "@/app/components/general/SelectModal";
import InputField from "../../onboarding/InputField";

type AddFarmModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddFarmModal = ({ visible, onClose }: AddFarmModalProps) => {
  const { addFarm } = useFarmerStore();

  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [regionModal, setRegionModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);

  const toggleCrop = (crop: string) => {
    setCropTypes((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );
  };

  const handleSave = () => {
    if (
      !farmName ||
      !farmSize ||
      !region ||
      !district ||
      cropTypes.length === 0
    ) {
      alert("Please fill all fields");
      return;
    }

    addFarm({
      farmName,
      farmSize: parseFloat(farmSize),
      region,
      district,
      cropTypes,
    });
    onClose();
    setFarmName("");
    setFarmSize("");
    setRegion("");
    setDistrict("");
    setCropTypes([]);
  };

  const regions = getAllRegions().map((r) => ({
    label: r,
    value: r,
    icon: <MapPin size={18} color="#4B5563" />,
  }));

  const districts = region
    ? getDistrictsByRegion(region).map((d) => ({
        label: d,
        value: d,
        icon: <MapPin size={18} color="#4B5563" />,
      }))
    : [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/40 justify-center px-6">
        <View className="bg-white rounded-2xl p-6 max-h-[90%]">
          <ScrollView>
            <Text className="text-lg font-bold mb-4">Add New Farm</Text>

            {/* Farm Name */}
            <InputField
              label="Farm Name"
              placeholder="eg. Adom Farms"
              icon="leaf"
              value={farmName}
              onChange={setFarmName}
              fieldKey="farmName"
              required
              focused={focused}
              setFocused={setFocused}
            />

            {/* Farm Size */}
            <InputField
              label="Farm Size (acres)"
              placeholder="2.5"
              icon="ruler"
              value={farmSize}
              onChange={setFarmSize}
              keyboardType="numeric"
              fieldKey="farmSize"
              required
              focused={focused}
              setFocused={setFocused}
            />

            {/* Region */}
            <Pressable onPress={() => setRegionModal(true)} className="mt-4">
              <Text className="font-medium">Region</Text>
              <Text className="border p-3 rounded-lg text-gray-700">
                {region || "Select Region"}
              </Text>
            </Pressable>

            {/* District */}
            <Pressable
              onPress={() => setDistrictModal(true)}
              disabled={!region}
              className="mt-4"
            >
              <Text className="font-medium">District</Text>
              <Text className="border p-3 rounded-lg text-gray-700">
                {district || "Select District"}
              </Text>
            </Pressable>

            {/* Crop Types */}
            <View className="mt-6">
              <Text className="font-semibold mb-2">Crop Types</Text>
              <View className="flex-row flex-wrap">
                {cropOptions.map((crop) => {
                  const selected = cropTypes.includes(crop);
                  return (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => toggleCrop(crop)}
                      className={`px-3 py-2 mr-2 mb-2 rounded-full border ${
                        selected
                          ? "bg-green-100 border-green-600"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <Sprout
                          size={14}
                          color={selected ? "green" : "gray"}
                          className="mr-1"
                        />
                        <Text
                          className={`text-sm ${
                            selected
                              ? "text-green-800 font-semibold"
                              : "text-gray-700"
                          }`}
                        >
                          {crop}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="flex-row justify-end mt-4">
            <Pressable onPress={onClose} className="mr-3 px-4 py-2">
              <Text className="text-gray-600">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              className="bg-green-600 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Save</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Region Modal */}
      <SelectModal
        visible={regionModal}
        title="Select Region"
        options={regions}
        onSelect={(val) => {
          setRegion(val);
          setDistrict("");
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
          setDistrict(val);
          setDistrictModal(false);
        }}
        onClose={() => setDistrictModal(false)}
      />
    </Modal>
  );
};

export default AddFarmModal;
