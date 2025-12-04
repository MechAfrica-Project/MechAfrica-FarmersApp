import { images } from "@/constants/images";
import { getAuthToken } from "@/lib/api";
import { useFarmerStore } from "@/stores/farmerStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { useTipsStore } from "@/stores/tipsStore";
import { Lightbulb, RefreshCw, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const WORD_LIMIT = 10;

const WelcomeAndUpdates = () => {
  const { data } = useOnboardingStore();
  const { profile, fetchProfile } = useFarmerStore();
  const { tips, currentTip, loading, fetchTips, refreshTips, markTipAsViewed } =
    useTipsStore();
  const [showFullTip, setShowFullTip] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch farmer profile on mount
  useEffect(() => {
    const token = typeof getAuthToken === "function" ? getAuthToken() : null;
    if (token) {
      fetchProfile();
    }
  }, [fetchProfile]);

  // Get the farmer's first name from profile or onboarding data
  // Also handle legacy 'name' field from backend
  const farmerFirstName =
    profile?.personalInfo?.firstName ||
    data.personalInfo?.firstName ||
    (profile?.personalInfo as any)?.name?.split?.(" ")?.[0] ||
    (data.personalInfo as any)?.name?.split?.(" ")?.[0] ||
    profile?.personalInfo?.lastName ||
    data.personalInfo?.lastName ||
    "";

  // Animation for refresh button
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const startSpinAnimation = () => {
    // Stop any existing animation
    if (spinAnimation.current) {
      spinAnimation.current.stop();
    }
    spinValue.setValue(0);

    // Create a looping animation
    spinAnimation.current = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spinAnimation.current.start();
  };

  const stopSpinAnimation = useCallback(() => {
    if (spinAnimation.current) {
      spinAnimation.current.stop();
      spinAnimation.current = null;
    }
    spinValue.setValue(0);
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Stop animation when refreshing completes
  useEffect(() => {
    if (!refreshing) {
      stopSpinAnimation();
    }
  }, [refreshing, stopSpinAnimation]);

  // Fetch tips on mount
  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  // Handle refresh tips
  const handleRefreshTips = async () => {
    if (refreshing) return; // Prevent double-tap

    if (__DEV__) {
      console.debug("Refresh tips button pressed");
    }

    setRefreshing(true);
    startSpinAnimation();

    try {
      await refreshTips();
    } catch (err) {
      console.error("Failed to refresh tips:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Mark current tip as viewed when it's displayed
  useEffect(() => {
    if (currentTip && !currentTip.viewed) {
      markTipAsViewed(currentTip.id);
    }
  }, [currentTip, markTipAsViewed]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Get the tip content to display
  const getTipContent = () => {
    if (loading) {
      return null;
    }

    if (currentTip) {
      return currentTip.content;
    }

    if (tips.length > 0) {
      return tips[0].content;
    }

    return "Welcome to MechAfrica! Check back soon for personalized farming tips based on your crops and location.";
  };

  const tipContent = getTipContent();

  // Check if tip content is longer than word limit
  const words = tipContent?.split(/\s+/) || [];
  const isLongTip = words.length > WORD_LIMIT;
  const truncatedContent = isLongTip
    ? words.slice(0, WORD_LIMIT).join(" ") + "..."
    : tipContent;

  return (
    <View className="relative flex-row bg-primary-green rounded-3xl mt-6 mx-4 h-[14rem]">
      {/* Left section (text) */}
      <View className="flex-1 bg-primary-green rounded-3xl p-4">
        <View>
          <Text className="text-white font-mulish font-bold text-2xl">
            {getGreeting()},
          </Text>
          <Text className="text-white font-mulish text-xl mb-2">
            Farmer {farmerFirstName}
          </Text>
        </View>

        <View style={{ paddingRight: 195, flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
              zIndex: 100,
            }}
          >
            <Text className="text-accent-yellow font-mulish font-bold text-sm flex-1">
              Tips from MechAfrica
            </Text>
            <TouchableOpacity
              onPress={handleRefreshTips}
              disabled={refreshing}
              activeOpacity={0.6}
              style={{
                padding: 6,
                zIndex: 101,
                opacity: refreshing ? 0.6 : 1,
              }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <RefreshCw size={14} color="#FCD34D" />
              </Animated.View>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-mulish text-sm ml-2">
                Loading tips...
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <Text
                className="text-white font-mulish text-sm leading-5"
                numberOfLines={3}
              >
                {truncatedContent}
              </Text>
              {isLongTip && (
                <TouchableOpacity
                  onPress={() => setShowFullTip(true)}
                  activeOpacity={0.7}
                  style={{ marginTop: 6, paddingVertical: 4 }}
                >
                  <Text className="text-accent-yellow font-mulish text-xs font-bold">
                    See more
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Right section (farmer + maize) */}
      <View pointerEvents="none" className="absolute bottom-0 right-0 z-10">
        <Image source={images.farmerWelcome} />
      </View>
      <View pointerEvents="none" className="absolute bottom-0 right-0">
        <Image source={images.cereal} style={{ height: 130, width: 130 }} />
      </View>

      {/* Full Tip Modal */}
      <Modal
        visible={showFullTip}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFullTip(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
          onPress={() => setShowFullTip(false)}
        >
          <Pressable
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 20,
              width: "100%",
              maxHeight: "75%",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 8,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    backgroundColor: "#D1FAE5",
                    padding: 10,
                    borderRadius: 12,
                    marginRight: 12,
                  }}
                >
                  <Lightbulb size={22} color="#047857" />
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#047857",
                    }}
                  >
                    Farming Tip
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                  >
                    From MechAfrica
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowFullTip(false)}
                activeOpacity={0.7}
                style={{
                  padding: 8,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 20,
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView
              style={{ paddingHorizontal: 20, paddingVertical: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 26,
                  color: "#374151",
                  fontWeight: "400",
                }}
              >
                {tipContent}
              </Text>
            </ScrollView>

            {/* Modal Footer */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 20,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowFullTip(false)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#047857",
                  borderRadius: 14,
                  paddingVertical: 14,
                  alignItems: "center",
                  shadowColor: "#047857",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Got it
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default WelcomeAndUpdates;
