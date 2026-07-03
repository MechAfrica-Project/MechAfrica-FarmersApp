import SelectModal from "@/app/components/general/SelectModal";
import { cropOptions } from "@/constants/cropOptions";
import {
  getAllRegions,
  getDistrictsByRegion,
} from "@/constants/ghana-regions-districts";
import { Farm, useFarmerStore } from "@/stores/farmerStore";
import { toastError, toastInfo } from "@/lib/toast";
import { MapPin, Sprout } from "lucide-react-native";
import React, { useState } from "react";
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
import FarmLocationPicker from "../components/FarmLocationPicker";

type AddFarmModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddFarmModal = ({ visible, onClose }: AddFarmModalProps) => {
  const { addFarm, farms } = useFarmerStore();

  const [farmName, setFarmName] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [cropTypes, setCropTypes] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [focused, setFocused] = useState<string | null>(null);
  const [regionModal, setRegionModal] = useState(false);
  const [districtModal, setDistrictModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleCrop = (crop: string) =>
    setCropTypes((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop]
    );

  const isValid = 
    farmName.trim() !== "" && 
    farmSize.toString().trim() !== "" && 
    region !== "" && 
    district !== "" && 
    cropTypes.length > 0;

  const isButtonDisabled = saving || !isValid;

  const handleSave = () => {
    if (!isValid) return;
    if (
      !farmName ||
      !farmSize ||
      !region ||
      !district ||
      cropTypes.length === 0
    ) {
      toastError('Validation', 'Please fill in all fields.');
      return;
    }

    // Prevent duplicating onboarding farm
    const exists = farms.some(
      (f) =>
        f.farmName.toLowerCase() === farmName.toLowerCase() &&
        f.region === region &&
        f.district === district
    );
    if (exists) {
      toastInfo('Duplicate', 'A farm with the same name, region, and district already exists.');
      return;
    }

    const newFarm: Omit<Farm, "id"> = {
      farmName,
      farmSize: parseFloat(farmSize),
      region,
      district,
      cropTypes,
      ...(latitude && longitude ? { latitude, longitude } : {})
    };

    // show a local saving state while addFarm resolves
    (async () => {
      try {
        setSaving(true);
        await addFarm(newFarm);

        // Reset modal fields
        setFarmName("");
        setFarmSize("");
        setRegion("");
        setDistrict("");
        setCropTypes([]);
        setLatitude(undefined);
        setLongitude(undefined);
        onClose();
      } catch {
        // swallow - store shows toast on error; keep modal open for retry
      } finally {
        setSaving(false);
      }
    })();
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
            Add New Farm
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

            {/* Location Picker */}
            <FarmLocationPicker
              value={latitude && longitude ? { latitude, longitude } : null}
              onChange={(coords) => {
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
              }}
              searchQuery={[district, region, "Ghana"].filter(Boolean).join(", ")}
            />

            {/* Region */}
            <TouchableOpacity 
              onPress={() => setRegionModal(true)} 
              className="mt-5"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-gray-800 mb-1 font-mulish">Region</Text>
              <View className="border border-gray-200 p-4 rounded-2xl bg-gray-50 shadow-sm">
                <Text
                  className={`font-mulish ${region ? "text-gray-800 font-bold" : "text-gray-400 font-medium"
                    }`}
                >
                  {region || "Select Region"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* District */}
            <TouchableOpacity
              onPress={() => setDistrictModal(true)}
              disabled={!region}
              className="mt-4"
              activeOpacity={0.7}
            >
              <Text className="text-sm font-bold text-gray-800 mb-1 font-mulish">District</Text>
              <View className={`border p-4 rounded-2xl shadow-sm ${!region ? "border-gray-100 bg-gray-50 opacity-60" : "border-gray-200 bg-gray-50"}`}>
                <Text
                  className={`font-mulish ${district ? "text-gray-800 font-bold" : "text-gray-400 font-medium"
                    }`}
                >
                  {district || "Select District"}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Crop Types */}
            <View className="mt-6">
              <Text className="text-base font-bold text-gray-800 mb-3 font-mulish">
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
                      className={`flex-row items-center px-4 py-2 mr-2 mb-2 rounded-xl border ${selected ? "bg-emerald-700 border-emerald-700" : "bg-white border-gray-200 shadow-sm"
                        }`}
                    >
                      <Sprout
                        size={14}
                        color={selected ? "#fff" : "#4B5563"}
                        className="mr-2"
                      />
                      <Text
                        className={`text-sm font-bold font-mulish ${selected ? "text-white" : "text-gray-700"
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
          <View className="flex-row items-center space-x-3 mt-6 pt-4 border-t border-gray-100">
            <TouchableOpacity 
              onPress={onClose} 
              className="flex-1 py-4 bg-gray-50 rounded-2xl items-center border border-gray-200" 
              disabled={saving}
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 font-bold font-mulish text-base">Cancel</Text>
            </TouchableOpacity>
            
            <View style={{ width: 12 }} />

            <TouchableOpacity
              onPress={handleSave}
              className={`flex-1 py-4 rounded-2xl items-center shadow-sm ${isButtonDisabled ? "bg-gray-300 shadow-none" : "bg-emerald-700"}`}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              {saving ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold font-mulish text-base">Saving...</Text>
                </View>
              ) : (
                <Text className={`font-bold font-mulish text-base ${isButtonDisabled ? "text-gray-500" : "text-white"}`}>Save Farm</Text>
              )}
            </TouchableOpacity>
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
