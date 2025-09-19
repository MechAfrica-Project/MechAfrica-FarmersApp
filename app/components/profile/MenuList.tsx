// components/profile/MenuList.tsx
import React from "react";
import { View } from "react-native";
import { useRouter, type Href } from "expo-router"; // 👈 import Href type
import MenuItem from "./MenuItems";
import { useAuthStore } from "@/stores/authStore";

type MenuItemType = {
  icon: string;
  label: string;
  route: Href; // 👈 enforce expo-router route type
};

const menuItems: MenuItemType[] = [
  { icon: "person-outline", label: "Account", route: "/profilePages/account" },
  { icon: "globe-outline", label: "Farms", route: "/profilePages/farms" },
  {
    icon: "shield-checkmark-outline",
    label: "Security",
    route: "/profilePages/security",
  },
  {
    icon: "document-text-outline",
    label: "Terms & Conditions",
    route: "/profilePages/terms",
  },
  {
    icon: "chatbubble-ellipses-outline",
    label: "Contact Agent",
    route: "/profilePages/contactAgent",
  },
];

const MenuList = () => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View className="mt-8 px-4">
      {menuItems.map((item, index) => (
        <MenuItem
          key={index}
          icon={item.icon}
          label={item.label}
          onPress={() => router.push(item.route)} // ✅ type-safe now
        />
      ))}

      {/* Logout separately styled */}
      <MenuItem
        icon="log-out-outline"
        label="Logout"
        danger
        onPress={handleLogout}
      />
    </View>
  );
};

export default MenuList;
