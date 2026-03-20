import SelectModal from "@/app/components/general/SelectModal";
import { cropOptions } from "@/constants/cropOptions";
import {
  getAllRegions,
  getDistrictsByRegion,
} from "@/constants/ghana-regions-districts";
import { Farm, useFarmerStore } from "@/stores/farmerStore";
import { toastError, toastSuccess } from "@/lib/toast";
import { MapPin, Sprout } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import InputField from "../../onboarding/InputField";

type EditFarmModalProps = {
  visible: boolean;
  onClose: () => void;
  farm: Farm | null;
};

const EditFarmModal = ({ visible, onClose, farm }: EditFarmModalProps) => {
  const { updateFarm, farms } = useFarmerStore();

  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [focused, setFocused] = useState<string | null>(null);
  const [regionModal, setRegionModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pre-populate fields when farm changes or modal opens
  useEffect(() => {
    if (farm && visible) {
      setFarmName(farm.farmName || "");
      setFarmSize(farm.farmSize?.toString() || "");
      setRegion(farm.region || "");
      setDistrict(farm.district || "");
      setCropTypes(farm.cropTypes || []);
    }
  }, [farm, visible]);

  const toggleCrop = (crop: string) =>
    setCropTypes((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );

  const handleSave = () => {
    if (!farm) return;

    if (
      !farmName ||
      !farmSize ||
      !region ||
      !district ||
      cropTypes.length === 0
    ) {
      toastError("Validation", "Please fill in all fields.");
      return;
    }

    // Check for duplicate farm (excluding current farm being edited)
    const exists = farms.some(
      (f) =>
        f.id !== farm.id &&
        f.farmName.toLowerCase() === farmName.toLowerCase() &&
        f.region === region &&
        f.district === district
    );
    if (exists) {
      toastError(
        "Duplicate",
        "A farm with the same name, region, and district already exists."
      );
      return;
    }

    const updatedFarm: Farm = {
      id: farm.id,
      farmName,
      farmSize: parseFloat(farmSize),
      region,
      district,
      cropTypes,
    };

    (async () => {
      try {
        setSaving(true);
        await updateFarm(updatedFarm);
        toastSuccess("Success", "Farm updated successfully.");
        onClose();
      } catch {
        // Store shows toast on error; keep modal open for retry
      } finally {
        setSaving(false);
      }
    })();
  };

  const handleClose = () => {
    // Reset fields on close
    setFarmName("");
    setFarmSize("");
    setRegion("");
    setDistrict("");
    setCropTypes([]);
    setFocused(null);
    onClose();
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center bg-black/40 px-6"
      >
        <View className="bg-white rounded-2xl p-6 max-h-[90%] shadow-xl">
          <Text className="text-xl font-bold mb-6 text-gray-900">
            Edit Farm Details
          </Text>

          <ScrollView
            contentContainerStyle={{ paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Farm Name */}
            <InputField
              label="Farm Name"
              placeholder="e.g., Adom Farms"
              icon="leaf"
              value={farmName}
              onChange={setFarmName}
              fieldKey="farmName"
              required
              focused={focused}
              setFocused={setFocused}
            />

            {/* Farm Size */}
            <View className="mt-5 relative">
              <InputField
                label="Farm Size (acres)"
                placeholder="2.5"
                icon="ruler"
                value={farmSize}
                onChange={setFarmSize}
                keyboardType="decimal-pad"
                allowDecimal
                fieldKey="farmSize"
                required
                focused={focused}
                setFocused={setFocused}
              />
              <Text className="absolute right-3 bottom-10 text-gray-500 font-medium">
                Acre
              </Text>
            </View>

            {/* Region */}
            <Pressable onPress={() => setRegionModal(true)} className="mt-5">
              <Text className="text-sm font-semibold mb-1">Region</Text>
              <View className="border p-3 rounded-lg bg-gray-50">
                <Text
                  className={`text-gray-700 ${region ? "font-medium" : "text-gray-400"
                    }`}
                >
                  {region || "Select Region"}
                </Text>
              </View>
            </Pressable>

            {/* District */}
            <Pressable
              onPress={() => setDistrictModal(true)}
              disabled={!region}
              className="mt-4"
            >
              <Text className="text-sm font-semibold mb-1">District</Text>
              <View className="border p-3 rounded-lg bg-gray-50">
                <Text
                  className={`text-gray-700 ${district ? "font-medium" : "text-gray-400"
                    }`}
                >
                  {district || "Select District"}
                </Text>
              </View>
            </Pressable>

            {/* Crop Types */}
            <View className="mt-6">
              <Text className="text-base font-semibold text-gray-800 mb-3">
                Crop Types
              </Text>
              <View className="flex-row flex-wrap">
                {cropOptions.map((crop) => {
                  const selected = cropTypes.includes(crop);
                  return (
                    <TouchableOpacity
                      key={crop}
                      onPress={() => toggleCrop(crop)}
                      activeOpacity={0.8}
                      className={`flex-row items-center px-4 py-2 mr-2 mb-2 rounded-full ${selected ? "bg-green-700" : "bg-gray-100"
                        }`}
                    >
                      <Sprout
                        size={14}
                        color={selected ? "#fff" : "#4B5563"}
                        className="mr-1"
                      />
                      <Text
                        className={`text-sm font-semibold ${selected ? "text-white" : "text-gray-800"
                          }`}
                      >
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Actions */}
          <View className="flex-row justify-end mt-6">
            <Pressable
              onPress={handleClose}
              className="mr-3 px-4 py-2 rounded-lg"
              disabled={saving}
            >
              <Text className="text-gray-600 font-medium">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              className="bg-green-600 px-6 py-2 rounded-lg"
              disabled={saving}
            >
              {saving ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-white font-semibold">Updating...</Text>
                </View>
              ) : (
                <Text className="text-white font-semibold">Update</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Region Modal */}
      <SelectModal
        visible={regionModal}
        title="Select Region"
        options={regions}
        onSelect={(val) => {
          setRegion(val);
          // Reset district when region changes
          if (val !== region) {
            setDistrict("");
          }
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

export default EditFarmModal;
