import { images } from "@/constants/images";
import { Farm, useFarmerStore } from "@/stores/farmerStore";
import { useUIStore } from "@/stores/uiStore";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
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
  const router = useRouter();
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
      } catch {
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
    <View className="flex-1 bg-gray-50 pt-14 px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="mr-3 p-2 bg-white rounded-full shadow-sm"
            activeOpacity={0.6}
          >
            <ChevronLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 font-mulish">My Farms</Text>
        </View>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center bg-green-600 px-4 py-2.5 rounded-xl shadow-sm"
          activeOpacity={0.8}
        >
          <PlusCircle size={18} color="white" />
          <Text className="text-white font-bold ml-2 font-mulish">Add Farm</Text>
        </TouchableOpacity>
      </View>

      {/* Sectioned List */}
      <SectionList
        sections={groupedData}
        keyExtractor={(item, index) => item.district + index}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-emerald-50/60 border border-emerald-100/60 px-4 py-2.5 rounded-2xl mt-6 mb-2 flex-row items-center">
            <View className="w-1.5 h-4 bg-green-600 rounded-full mr-2.5" />
            <Text className="text-lg font-bold text-green-800 font-mulish">{title}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isExpanded = expandedDistricts[item.district];
          return (
            <View className="ml-2 mt-2">
              {/* District Header */}
              <TouchableOpacity
                onPress={() => toggleDistrict(item.district)}
                className="flex-row items-center py-3 px-4 rounded-2xl bg-white shadow-sm border border-gray-100"
                activeOpacity={0.7}
              >
                {isExpanded ? (
                  <ChevronDown size={20} color="#047857" />
                ) : (
                  <ChevronRight size={20} color="#047857" />
                )}
                <MapPin size={18} color="#047857" className="ml-3" />
                <Text className="ml-2 font-bold text-gray-800 font-mulish text-base">
                  {item.district}
                </Text>
              </TouchableOpacity>

              {/* Farms */}
              {isExpanded &&
                item.farms.map((farm: any) => (
                  <View
                    key={farm.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 ml-6 overflow-hidden"
                  >
                    <Image
                      source={images.farmField}
                      className="w-full h-32"
                      resizeMode="cover"
                    />
                    <View className="absolute top-0 left-0 w-full h-32 bg-black/10" />
                    <View className="p-4 flex-row justify-between items-start">
                      <View className="flex-1">
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Text className="text-lg font-bold text-gray-900 font-mulish">
                            {farm.farmName}
                          </Text>
                          {(farm as any)?._queued && (
                            <View className="ml-3 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-md">
                              <Text className="text-yellow-800 text-[10px] font-bold font-mulish uppercase tracking-wider">Queued</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-gray-500 font-medium mt-1 font-mulish">
                          {farm.farmSize} acres
                        </Text>
                        <View className="flex-row flex-wrap mt-3">
                          {farm.cropTypes.length > 0 ? (
                            farm.cropTypes.map((crop: string) => (
                              <View
                                key={crop}
                                className="bg-emerald-50 border border-emerald-100 px-2.5 py-1 mr-2 mb-2 rounded-lg"
                              >
                                <Text className="text-xs font-bold text-emerald-700 font-mulish">
                                  {crop}
                                </Text>
                              </View>
                            ))
                          ) : (
                            <Text className="text-gray-400 text-sm mt-1 font-mulish italic">
                              No crops added
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Action Buttons */}
                      <View className="flex-col items-center gap-3">
                        {/* Edit Farm */}
                        <TouchableOpacity
                          onPress={() => handleEditFarm(farm)}
                          className="p-2.5 rounded-full bg-emerald-50 shadow-sm border border-emerald-100/50"
                          activeOpacity={0.5}
                        >
                          <Pencil size={18} color="#047857" />
                        </TouchableOpacity>

                        {/* Delete Farm */}
                        {farm.id !== "onboarding-farm" && (
                          <TouchableOpacity
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
                                  position: 'top',
                                  props: {
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
                                  },
                                });
                              } catch { }
                              setBusyIds((s) => {
                                const c = { ...s };
                                delete c[farm.id];
                                return c;
                              });
                            }}
                            className="p-2.5 rounded-full bg-red-50 shadow-sm border border-red-100/50"
                            disabled={!!busyIds[farm.id]}
                            activeOpacity={0.5}
                          >
                            {busyIds[farm.id] ? (
                              <ActivityIndicator size="small" color="#DC2626" />
                            ) : (
                              <Trash2 size={18} color="#DC2626" />
                            )}
                          </TouchableOpacity>
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
          <Text className="text-white mt-3 font-medium font-mulish">
            Loading farms...
          </Text>
        </View>
      )}
    </View>
  );
};

export default Farms;
