// components/profile/MenuList.tsx
import React, { useState } from "react";
import { View } from "react-native";
import { useRouter, type Href } from "expo-router";
import MenuItem from "./MenuItems";
import { useAuthStore } from "@/stores/authStore";
import AccountEditModal from "./modals/AccountEditModal";
import TermsModal from "./modals/TermsModal";

type ModalKey = "account" | "terms";

type MenuItemType =
  | { icon: string; label: string; type: "route"; route: Href }
  | { icon: string; label: string; type: "modal"; modalKey: ModalKey };

const menuItems: MenuItemType[] = [
  { icon: "person-outline", label: "Account", type: "modal", modalKey: "account" },
  { icon: "globe-outline", label: "Farms", type: "route", route: "/profilePages/farms" },
  { icon: "shield-checkmark-outline", label: "Security", type: "route", route: "/profilePages/security" },
  { icon: "document-text-outline", label: "Terms & Conditions", type: "modal", modalKey: "terms" },
  { icon: "chatbubble-ellipses-outline", label: "Contact Agent", type: "route", route: "/profilePages/contactAgent" },
];

const MenuList = () => {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [activeModal, setActiveModal] = useState<ModalKey | null>(null);

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
          onPress={() => {
            if (item.type === "route") {
              router.push(item.route);
            } else {
              setActiveModal(item.modalKey);
            }
          }}
        />
      ))}

      {/* Logout separately styled */}
      <MenuItem
        icon="log-out-outline"
        label="Logout"
        danger
        onPress={handleLogout}
      />

      {/* ✅ Account Edit Modal */}
      <AccountEditModal
        visible={activeModal === "account"}
        onClose={() => setActiveModal(null)}
      />

      {/* ✅ Terms Modal */}
      <TermsModal
        visible={activeModal === "terms"}
        onClose={() => setActiveModal(null)}
      />
    </View>
  );
};

export default MenuList;
