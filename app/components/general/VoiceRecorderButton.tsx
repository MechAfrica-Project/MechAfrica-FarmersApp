import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Mic } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";

// Props for Ripple
interface RippleProps {
  delay: number;
}

const Ripple: React.FC<RippleProps> = ({ delay }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    // run forever
    scale.value = withRepeat(
      withDelay(delay, withTiming(3, { duration: 2000 })),
      -1,
      false
    );
    opacity.value = withRepeat(
      withDelay(delay, withTiming(0, { duration: 2000 })),
      -1,
      false
    );
  }, [delay]);

  return (
    <Animated.View
      className="absolute w-14 h-14 border border-green-400 rounded-full"
      style={style}
      pointerEvents="none"
    />
  );
};

// Props for main button
interface VoiceRecorderButtonProps {
  isRecording: boolean;
  handleRecordVoice: () => void;
}

const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({
  isRecording,
  handleRecordVoice,
}) => {
  return (
    <View className="relative flex-col justify-center items-center h-24">
      {/* Echo Ripples */}
      {isRecording &&
        [0, 600, 1200].map((d, i) => <Ripple key={i} delay={d} />)}

      {/* Mic Button */}
      <TouchableOpacity
        className="self-center border border-green-300 w-20 h-20 rounded-full bg-emerald-50 justify-center items-center"
        onPress={handleRecordVoice}
      >
        <Mic size={28} color={isRecording ? "red" : "#00C389"} />
      </TouchableOpacity>
    </View>
  );
};

export default VoiceRecorderButton;
