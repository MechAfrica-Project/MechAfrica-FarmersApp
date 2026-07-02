import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useRequestsStore } from "@/stores/requestsStore";
import { getAuthToken } from "@/lib/api";
import SentRequests from "@/app/components/servicesTabs/SentRequests";
import OnGoingRequests from "@/app/components/servicesTabs/OnGoingRequests";
import CompletedRequests from "@/app/components/servicesTabs/CompletedRequests";
import CancelledRequests from "@/app/components/servicesTabs/CancelledRequests";
import { WifiOff } from "lucide-react-native";

type TabType = "Sent" | "On-going" | "Completed" | "Cancelled";

const tabs: TabType[] = ["Sent", "On-going", "Completed", "Cancelled"];

const Requests = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Sent");
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const fetchRequests = useRequestsStore((s) => s.fetchRequests);
  const loading = useRequestsStore((s) => s.loading);
  const error = useRequestsStore((s) => s.error);
  const byId = useRequestsStore((s) => s.byId);
  const hasRequests = Object.keys(byId).length > 0;
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch requests from backend when tab mounts
  useEffect(() => {
    const loadRequests = async () => {
      const token = typeof getAuthToken === "function" ? getAuthToken() : null;
      if (token) {
        await fetchRequests();
      }
      setInitialLoad(false);
    };
    loadRequests();
  }, [fetchRequests]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    const token = typeof getAuthToken === "function" ? getAuthToken() : null;
    if (!token) return;

    setRefreshing(true);
    try {
      await fetchRequests();
    } finally {
      setRefreshing(false);
    }
  }, [fetchRequests]);

  // Dynamic scaling
  const padding = SCREEN_WIDTH < 360 ? 8 : 12;
  const tabPaddingHorizontal = SCREEN_WIDTH < 360 ? 10 : 16;
  const tabPaddingVertical = SCREEN_WIDTH < 360 ? 6 : 12;
  const fontSize = SCREEN_WIDTH < 360 ? 12 : 14;
  const tabSpacing = SCREEN_WIDTH < 360 ? 6 : 12;
  const topPadding = SCREEN_WIDTH < 360 ? 60 : 80;

  const renderContent = () => {
    // Show loading spinner on initial load
    if (initialLoad && loading) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#059669" />
          <Text className="text-gray-500 mt-3 font-mulish">Loading requests...</Text>
        </View>
      );
    }

    // Show error state with retry option only if there is no cached data
    if (error && !loading && !hasRequests) {
      return (
        <View className="flex-1 justify-center items-center px-6 pb-20">
          <View className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6 shadow-sm shadow-red-100/50">
            <WifiOff size={40} color="#EF4444" strokeWidth={1.5} />
          </View>
          <Text className="text-gray-900 font-bold text-2xl mb-3 font-mulish text-center">
            You're offline
          </Text>
          <Text className="text-gray-500 text-center mb-8 font-mulish text-base leading-relaxed max-w-[280px]">
            {error === "You appear to be offline or the server is unreachable. Please check your connection."
              ? "We couldn't reach our servers. Please check your internet connection and try again."
              : error}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            activeOpacity={0.8}
            className="bg-primary-green px-8 py-4 rounded-2xl flex-row items-center justify-center w-full shadow-sm shadow-primary-green/30"
          >
            <Text className="text-white font-bold text-base font-mulish">Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case "Sent":
        return <SentRequests />;
      case "On-going":
        return <OnGoingRequests />;
      case "Completed":
        return <CompletedRequests />;
      case "Cancelled":
        return <CancelledRequests />;
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        padding,
        paddingTop: topPadding,
      }}
    >
      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: tabSpacing,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={1}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: tabPaddingHorizontal,
                paddingVertical: tabPaddingVertical,
                borderRadius: 24,
                backgroundColor: isActive ? "#059669" : "#ffffff",
                borderWidth: isActive ? 0 : 1,
                borderColor: "#d1d5db",
              }}
            >
              <Text
                style={{
                  fontFamily: "Mulish",
                  fontSize,
                  color: isActive ? "#ffffff" : "#374151",
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content with pull-to-refresh */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

export default Requests;
