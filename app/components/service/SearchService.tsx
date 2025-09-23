import React, { useState } from "react";
import { View, TextInput, FlatList, TouchableOpacity } from "react-native";
import { Search } from "lucide-react-native";
import { servicesData } from "@/constants/servicesData";
import { SafeAreaView } from "react-native-safe-area-context";
import ServiceCard from "../general/ServiceCard";
import { useRouter } from "expo-router";

const SearchService = () => {
  const [search, setSearch] = useState("");

  // Filter services by search text
  const filteredServices = servicesData.filter((service) =>
    service.title.toLowerCase().includes(search.toLowerCase())
  );
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFFE0]">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 m-4 shadow-sm">
        <TextInput
          placeholder="Type service name"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-base text-gray-700"
        />
        <TouchableOpacity>
          <Search size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Services Grid */}
      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            image={item.image}
            title={item.title}
            subtitle={item.subtitle}
            rating={item.rating}
            onPress={() =>
              router.push({
                pathname: "/components/service/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-around" }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default SearchService;
