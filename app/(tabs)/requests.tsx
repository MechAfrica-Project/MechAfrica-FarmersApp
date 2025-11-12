import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import SentRequests from "../components/servicesTabs/SentRequests";
import OnGoingRequests from "../components/servicesTabs/OnGoingRequests";
import CompletedRequests from "../components/servicesTabs/CompletedRequests";
import CancelledRequests from "../components/servicesTabs/CancelledRequests";

type TabType = "Sent" | "On-going" | "Completed" | "Cancelled";

const tabs: TabType[] = ["Sent", "On-going", "Completed", "Cancelled"];

const Requests = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Sent");
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Dynamic scaling
  const padding = SCREEN_WIDTH < 360 ? 8 : 12;
  const tabPaddingHorizontal = SCREEN_WIDTH < 360 ? 10 : 16;
  const tabPaddingVertical = SCREEN_WIDTH < 360 ? 6 : 12;
  const fontSize = SCREEN_WIDTH < 360 ? 12 : 14;
  const tabSpacing = SCREEN_WIDTH < 360 ? 6 : 12;
  const topPadding = SCREEN_WIDTH < 360 ? 60 : 80;

  const renderContent = () => {
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

      {/* Tab content */}
      <View style={{ flex: 1 }}>{renderContent()}</View>
    </View>
  );
};

export default Requests;
