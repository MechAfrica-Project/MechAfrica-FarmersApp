import { View, Text, SectionList, Pressable } from "react-native";
import React, { useState, useEffect } from "react";
import { useFarmerStore } from "@/stores/farmerStore";
import AddFarmModal from "../modals/AddFarmModal";
import { ChevronDown, ChevronRight, Plus } from "lucide-react-native";

const Farms = () => {
  const { farms, fetchProfile, loading, error } = useFarmerStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedDistricts, setExpandedDistricts] = useState<
    Record<string, boolean>
  >({});

  // ✅ Fetch farms on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Group farms by Region -> District
  const groupedData = farms.reduce((acc: any[], farm) => {
    const regionIdx = acc.findIndex((r) => r.title === farm.region);
    if (regionIdx === -1) {
      acc.push({
        title: farm.region,
        data: [{ district: farm.district, farms: [farm] }],
      });
    } else {
      const region = acc[regionIdx];
      const districtIdx = region.data.findIndex(
        (d: any) => d.district === farm.district
      );
      if (districtIdx === -1) {
        region.data.push({ district: farm.district, farms: [farm] });
      } else {
        region.data[districtIdx].farms.push(farm);
      }
    }
    return acc;
  }, []);

  const toggleDistrict = (district: string) => {
    setExpandedDistricts((prev) => ({
      ...prev,
      [district]: !prev[district],
    }));
  };

  return (
    <View className="flex-1 mt-12 px-4 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-900">My Farms</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-green-600 px-4 py-2 rounded-lg shadow-sm"
        >
          <Plus size={18} color="white" />
          <Text className="text-white font-semibold ml-2">Add Farm</Text>
        </Pressable>
      </View>

      {/* Loading/Error states */}
      {loading && <Text className="text-gray-500 italic">Loading farms...</Text>}
      {error && <Text className="text-red-500">{error}</Text>}

      {/* Grouped List */}
      <SectionList
        sections={groupedData}
        keyExtractor={(item, index) => item.district + index}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-green-100 px-3 py-2 rounded-md mt-4">
            <Text className="text-lg font-bold text-green-700">{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isExpanded = expandedDistricts[item.district];
          return (
            <View className="ml-2 mt-3">
              {/* District Header */}
              <Pressable
                onPress={() => toggleDistrict(item.district)}
                className="flex-row items-center py-2 px-2 rounded-md bg-gray-100"
              >
                {isExpanded ? (
                  <ChevronDown size={18} color="#374151" />
                ) : (
                  <ChevronRight size={18} color="#374151" />
                )}
                <Text className="ml-2 font-semibold text-gray-800">
                  📍 {item.district}
                </Text>
              </Pressable>

              {/* Farms under district */}
              {isExpanded &&
                item.farms.map((farm: any) => (
                  <View
                    key={farm.id}
                    className="border border-gray-200 rounded-lg p-4 mt-2 bg-white shadow-sm ml-6"
                  >
                    <Text className="font-bold text-lg text-gray-900">
                      {farm.farmName}
                    </Text>
                    <Text className="text-gray-700 text-sm">
                      {farm.farmSize} acres
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      Crops:{" "}
                      {farm.cropTypes.length > 0
                        ? farm.cropTypes.join(", ")
                        : "None"}
                    </Text>
                  </View>
                ))}
            </View>
          );
        }}
      />

      {/* Add Farm Modal */}
      <AddFarmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Farms;
