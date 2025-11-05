import { Search } from "lucide-react-native";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import ServiceRequestSection from "./ServiceRequestSection";

interface ServiceHeaderProps {
  search: string;
  setSearch: (text: string) => void;
}

const ServiceHeader: React.FC<ServiceHeaderProps> = ({ search, setSearch }) => {
  return (
    <View>
      <ServiceRequestSection />
      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-2xl px-4 mt-[2rem] py-3 m-4 border border-gray-300">
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
    </View>
  );
};

export default ServiceHeader;
