import { icons } from "@/constants/icons";
import { LANGUAGES } from "@/constants/languages";
import { useOnboardingStore } from "@/stores/onboardingStore";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LanguageStep() {
  const { updateData } = useOnboardingStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (lang: { code: string; name: string; flag: string }) => {
    updateData({ language: lang.code });
    setDropdownOpen(false);
    setSearch(lang.name); // show selection in the input
  };

  return (
    <View className="mt-6">
      {/* Search Input with Globe */}
      <Text className="mt-[6rem] mb-3 text-gray-color/75">All languages</Text>
      <View className="flex-row items-center rounded-xl px-3 bg-gray-color/10">
        <TouchableOpacity className="" onPress={() => setDropdownOpen((p) => !p)}>
          <Image source={icons.globe} className="size-[3.5rem]" />
        </TouchableOpacity>
        <TextInput
          placeholder="Language name"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 font-mulish text-[1.1rem] placeholder:text-gray-color/45 h-full"
        />
        <TouchableOpacity
          className="px-5 py-3 rounded-xl bg-teal-700"
          onPress={() => setDropdownOpen((p) => !p)}
        >
          <Text className="text-white font-mulish font-semibold">Search</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <View className="mt-4 border rounded-xl bg-white shadow max-h-56">
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredLanguages.map((item) => (
              <TouchableOpacity
                key={item.code}
                onPress={() => handleSelect(item)}
                className="px-4 py-3 border-b border-gray-200 flex-row items-center"
              >
                <Text className="mr-2 text-lg">{item.flag}</Text>
                <Text className="text-gray-800 text-[1.05rem]">
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
