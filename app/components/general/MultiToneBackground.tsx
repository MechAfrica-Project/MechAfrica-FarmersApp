import React from "react";
import { View } from "react-native";

type Props = {
  topColor?: string;
  mainColor: string;
  bottomColor?: string;
  topHeight?: number; // default: 100
  bottomHeight?: number; // default: 100
  children?: React.ReactNode;
};

const MultiToneBackground: React.FC<Props> = ({
  topColor,
  mainColor,
  bottomColor,
  topHeight = 100,
  bottomHeight = 100,
  children,
}) => {
  return (
    <View className="flex-1 relative">
      {/* Top background */}
      {topColor && (
        <View
          style={{
            height: topHeight,
            backgroundColor: topColor,
          }}
        />
      )}

      {/* Middle background */}
      <View style={{ flex: 1, backgroundColor: mainColor }} />

      {/* Bottom background */}
      {bottomColor && (
        <View
          style={{
            height: bottomHeight,
            backgroundColor: bottomColor,
          }}
        />
      )}

      {/* Foreground content overlays everything */}
      <View className="absolute inset-0">{children}</View>
    </View>
  );
};

export default MultiToneBackground;
