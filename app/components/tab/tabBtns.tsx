import {
  Text,
  ImageSourcePropType,
  ImageBackground,
  Image,
} from "react-native";
import React from "react";

interface TabBtnsProps {
  title: string;
  tabIcon: ImageSourcePropType;
  focused?: boolean;
}

const TabBtns: React.FC<TabBtnsProps> = ({ title, tabIcon, focused }) => {
  return (
    <ImageBackground className="w-full flex-1 min-w-[112px] min-h-16 mt-10 justify-center items-center rounded-full overflow-hidden">
      <Image
        source={tabIcon}
        tintColor={focused ? "#00594C" : "#605D6780"}
        className="size-6"
      />
      <Text
        className={`text-sm font-mulish ${
          focused ? "text-primary-green" : "text-gray-color/50"
        }`}
      >
        {title}
      </Text>
    </ImageBackground>
  );
};

export default TabBtns;
