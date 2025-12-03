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
import SentRequests from "../components/servicesTabs/SentRequests";
import OnGoingRequests from "../components/servicesTabs/OnGoingRequests";
import CompletedRequests from "../components/servicesTabs/CompletedRequests";
import CancelledRequests from "../components/servicesTabs/CancelledRequests";

type TabType = "Sent" | "On-going" | "Completed" | "Cancelled";

const tabs: TabType[] = ["Sent", "On-going", "Completed", "Cancelled"];

const Requests = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Sent");
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const fetchRequests = useRequestsStore((s) => s.fetchRequests);
  const loading = useRequestsStore((s) => s.loading);
  const error = useRequestsStore((s) => s.error);
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

    // Show error state with retry option
    if (error && !loading) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-red-500 text-center mb-4 font-mulish">{error}</Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-green-600 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Retry</Text>
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
