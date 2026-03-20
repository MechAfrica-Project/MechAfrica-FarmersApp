import React from "react";
import { icons } from "@/constants/icons";
import { Tabs } from "expo-router";
import TabBtns from "@/app/components/tab/tabBtns";
import { usePushNotifications } from "@/utils/usePushNotifications";

const TabLayout = () => {
  // Initialize Push Notifications
  usePushNotifications({
    appType: "farmer",
    enabled: true,
    autoRegister: true,
  });

  const tabs = [
    { name: "index", title: "Home", icon: icons.home },
    { name: "services", title: "Services", icon: icons.services },
    { name: "requests", title: "Requests", icon: icons.requests },
    { name: "profile", title: "Profile", icon: icons.profile },
  ];
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {

        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.name,
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabBtns focused={focused} title={tab.title} tabIcon={tab.icon} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
