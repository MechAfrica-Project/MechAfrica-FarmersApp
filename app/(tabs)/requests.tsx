import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import SentRequests from "../components/servicesTabs/SentRequests";
import OnGoingRequests from "../components/servicesTabs/OnGoingRequests";
import CompletedRequests from "../components/servicesTabs/CompletedRequests";
import CancelledRequests from "../components/servicesTabs/CancelledRequests";

type TabType = "Sent" | "On-going" | "Completed" | "Cancelled";

const tabs: TabType[] = ["Sent", "On-going", "Completed", "Cancelled"];

const Requests = () => {
  const [activeTab, setActiveTab] = useState<TabType>("Sent");

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
    <View className="flex-1 bg-white p-2 pt-[4rem]">
      {/* Tabs */}
      <View className="flex-row gap-2 justify-around mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={1}
              onPress={() => setActiveTab(tab)}
              className={`px-4 py-3 rounded-2xl ${
                isActive ? "bg-primary-green " : "border border-gray-300"
              }`}
            >
              <Text
                className={`font-mulish ${
                  isActive ? "text-white font-semibold" : "text-gray-700"
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      <View className="flex-1">{renderContent()}</View>
    </View>
  );
};

export default Requests;
