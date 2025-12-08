import { images } from "@/constants/images";
import { Farm, useFarmerStore } from "@/stores/farmerStore";
import { useUIStore } from "@/stores/uiStore";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  SectionList,
  Text,
  UIManager,
  View,
} from "react-native";
import AddFarmModal from "../modals/AddFarmModal";
import EditFarmModal from "../modals/EditFarmModal";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Farms = () => {
  const { farms, fetchProfile, loading, removeFarm } = useFarmerStore();
  const modalVisible = useUIStore((s) => s.addFarmModalVisible);
  const setModalVisible = useUIStore((s) => s.setAddFarmModalVisible);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});
  const [expandedDistricts, setExpandedDistricts] = useState<Record<string, boolean>>({});
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [farmToEdit, setFarmToEdit] = useState<Farm | null>(null);

  const handleEditFarm = (farm: Farm) => {
    setFarmToEdit(farm);
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setFarmToEdit(null);
  };

  useEffect(() => {
    // Only fetch profile from backend if user is authenticated.
    // This avoids unnecessary protected requests when unauthenticated
    // and prevents noisy authorization warnings in logs.
    (async () => {
      try {
        const { getAuthToken } = await import('@/lib/api');
        const token = typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (token) {
          fetchProfile();
        } else {
          // No token: keep local onboarding farm only
          console.debug('Farms screen: skipping fetchProfile - no auth token');
        }
      } catch (e) {
        // fallback: attempt fetch (defensive)
        try { fetchProfile(); } catch { }
      }
    })();
  }, [fetchProfile]);

  useEffect(() => {
    const onboardingFarm = farms.find((f) => f.id === "onboarding-farm");
    if (onboardingFarm) {
      setExpandedDistricts((prev: Record<string, boolean>) => ({
        ...prev,
        [onboardingFarm.district]: true,
      }));
    }
  }, [farms]);

  const toggleDistrict = (district: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedDistricts((prev: Record<string, boolean>) => ({
      ...prev,
      [district]: !prev[district],
    }));
  };

  // Group farms by region -> district
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

  return (
    <View className="flex-1 bg-gray-50 pt-12 px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-gray-900">My Farms</Text>
        <Pressable
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-green-600 px-4 py-2 rounded-xl shadow-md"
        >
          <PlusCircle size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Farm</Text>
        </Pressable>
      </View>

      {/* Sectioned List */}
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
                  <ChevronDown size={20} color="#047857" />
                ) : (
                  <ChevronRight size={20} color="#047857" />
                )}
                <MapPin size={18} color="#047857" className="ml-2" />
                <Text className="ml-2 font-semibold text-gray-800">
                  {item.district}
                </Text>
              </Pressable>

              {/* Farms */}
              {isExpanded &&
                item.farms.map((farm: any) => (
                  <View
                    key={farm.id}
                    className="bg-white rounded-xl shadow-lg mt-4 ml-6 mr-2 overflow-hidden"
                  >
                    <Image
                      source={images.farmField}
                      className="w-full h-32"
                      resizeMode="cover"
                    />
                    <View className="absolute top-0 left-0 w-full h-32 bg-black/5 rounded-t-xl" />
                    <View className="p-4 flex-row justify-between items-start">
                      <View className="flex-1">
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text className="text-lg font-bold text-gray-900">
                            {farm.farmName}
                          </Text>
                          {(farm as any)?._queued && (
                            <View className="ml-2 bg-yellow-500 px-2 py-1 rounded-full">
                              <Text className="text-white text-xs">Queued</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-600 mt-1">
                          {farm.farmSize} acres
                        </Text>
                        <View className="flex-row flex-wrap mt-2">
                          {farm.cropTypes.length > 0 ? (
                            farm.cropTypes.map((crop: string) => (
                              <View
                                key={crop}
                                className="bg-green-100 px-2 py-1 mr-2 mb-1 rounded-full"
                              >
                                <Text className="text-xs text-green-800">
                                  {crop}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text className="text-gray-500 text-sm mt-1">
                              No crops
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-col items-center gap-2">
                        {/* Edit Farm */}
                        <Pressable
                          onPress={() => handleEditFarm(farm)}
                          className="p-2 rounded-full bg-green-100"
                        >
                          <Pencil size={20} color="#047857" />
                        </Pressable>

                        {/* Delete Farm */}
                        {farm.id !== "onboarding-farm" && (
                          <Pressable
                            onPress={async () => {
                              setBusyIds((s) => ({ ...s, [farm.id]: true }));
                              try {
                                // capture farm snapshot for undo
                                const snapshot = { ...farm } as any;
                                // call delete (fire-and-forget)
                                removeFarm(farm.id).catch(() => { });
                                // show actionable toast with Undo
                                const { default: showToast } = await import('@/lib/toast');
                                const restoreFarm = useFarmerStore.getState().restoreFarm;
                                showToast({
                                  type: 'info',
                                  text1: 'Farm deleted',
                                  text2: undefined,
                                  visibilityTime: 5000,
                                  placement: 'top',
                                  actions: [
                                    {
                                      label: 'Undo',
                                      onPress: () => {
                                        try {
                                          restoreFarm(snapshot);
                                        } catch { }
                                      },
                                      style: 'primary',
                                    },
                                  ],
                                });
                              } catch { }
                              setBusyIds((s) => {
                                const c = { ...s };
                                delete c[farm.id];
                                return c;
                              });
                            }}
                            className="p-2 rounded-full bg-red-50"
                            disabled={!!busyIds[farm.id]}
                          >
                            {busyIds[farm.id] ? (
                              <ActivityIndicator size="small" color="#DC2626" />
                            ) : (
                              <Trash2 size={20} color="#DC2626" />
                            )}
                          </Pressable>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          );
        }}
      />

      {/* Add Farm Modal */}
      <AddFarmModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* Edit Farm Modal */}
      <EditFarmModal
        visible={editModalVisible}
        onClose={handleCloseEditModal}
        farm={farmToEdit}
      />

      {/* ✅ Global Fullscreen Loader Overlay */}
      {loading && (
        <View className="absolute inset-0 flex items-center justify-center bg-black/40 z-50">
          <ActivityIndicator size="large" color="#10B981" />
          <Text className="text-white mt-3 font-medium">
            Loading farms...
          </Text>
        </View>
      )}
    </View>
  );
};

export default Farms;
