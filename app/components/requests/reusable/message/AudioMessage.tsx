import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  PanResponder,
  Animated,
  LayoutChangeEvent,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio, AVPlaybackStatus } from "expo-av";

interface AudioMessageProps {
  voiceNoteUrl?: string | null;
}

const BAR_WIDTH = 3;
const BAR_MARGIN = 2;
const NUM_BARS = 40;

const AudioMessage = ({ voiceNoteUrl }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [waveformWidth, setWaveformWidth] = useState(0);
  const [waveformX, setWaveformX] = useState(0);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);

  const soundRef = useRef<Audio.Sound | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const waveformRef = useRef<View | null>(null);

  const bars = useRef<number[]>(
    Array.from({ length: NUM_BARS }, () => 8 + Math.random() * 24)
  ).current;

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, []);

  const formatTime = (millis: number) => {
    const totalSec = Math.floor(millis / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const startWavePulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [waveAnim]);

  const stopWavePulse = useCallback(() => {
    waveAnim.stopAnimation();
    waveAnim.setValue(0);
  }, [waveAnim]);

  const updateProgress = useCallback(
    (pos: number, dur: number) => {
      const p = dur > 0 ? pos / dur : 0;
      progressAnim.setValue(p);
    },
    [progressAnim]
  );

  const playOrPauseAudio = async () => {
    if (!voiceNoteUrl) return;

    try {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
            stopWavePulse();
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
            startWavePulse();
          }
        }
        return;
      }

      setIsLoading(true);
      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceNoteUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;
        setIsLoading(false);
        setPosition(status.positionMillis);
        setDuration(status.durationMillis ?? 1);

        if (dragProgress === null) {
          updateProgress(status.positionMillis, status.durationMillis ?? 1);
        }

        if (status.didJustFinish) {
          setIsPlaying(false);
          setPosition(0);
          stopWavePulse();
        }
      });

      setIsPlaying(true);
      startWavePulse();
    } catch (err) {
      console.error("Audio playback error:", err);
      setIsLoading(false);
    }
  };

  const onWaveformLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWaveformWidth(w);
    waveformRef.current?.measure((x, y, width, height, pageX) => {
      setWaveformX(pageX);
    });
  };

  const seekTo = async (progress: number) => {
    if (!soundRef.current || duration === 0) return;
    const newPosition = Math.max(0, Math.min(progress, 1)) * duration;
    await soundRef.current.setPositionAsync(newPosition);
    setPosition(newPosition);
    updateProgress(newPosition, duration);
  };

  const handleDrag = (e: GestureResponderEvent) => {
    if (waveformWidth === 0) return;
    const pageX = e.nativeEvent.pageX;
    const x = Math.max(0, Math.min(pageX - waveformX, waveformWidth));
    const progress = waveformWidth > 0 ? x / waveformWidth : 0;
    setDragProgress(progress);
    updateProgress(progress * duration, duration);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: async (e) => {
        setWasPlayingBeforeDrag(isPlaying);
        if (soundRef.current && isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          stopWavePulse();
        }
        handleDrag(e);
      },
      onPanResponderMove: (e) => handleDrag(e),
      onPanResponderRelease: async () => {
        if (dragProgress !== null) {
          await seekTo(dragProgress);
          setDragProgress(null);
          if (wasPlayingBeforeDrag && soundRef.current) {
            await soundRef.current.playAsync();
            setIsPlaying(true);
            startWavePulse();
          }
        }
      },
    })
  ).current;

  const progressTranslateX = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, waveformWidth],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, waveformWidth],
  });

  const barAnimatedStyle = useCallback(
    (height: number) => ({
      height,
      width: BAR_WIDTH,
      marginHorizontal: BAR_MARGIN / 2,
      borderRadius: 2,
      opacity: waveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
      }),
    }),
    [waveAnim]
  );

  const renderBars = useCallback(
    (color: string) =>
      bars.map((h, i) => (
        <Animated.View
          key={i}
          style={[barAnimatedStyle(h), { backgroundColor: color }]}
        />
      )),
    [bars, barAnimatedStyle]
  );

  return (
    <View className="mt-2 w-full">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-gray-800">{formatTime(position)}</Text>

        <View className="flex-row items-center flex-1 mx-2">
          <TouchableOpacity
            onPress={playOrPauseAudio}
            disabled={isLoading}
            className="h-9 w-9 rounded-full bg-yellow-300 justify-center items-center mr-2"
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={20}
                color="black"
              />
            )}
          </TouchableOpacity>

          <View
            ref={waveformRef}
            onLayout={onWaveformLayout}
            {...panResponder.panHandlers}
            className="flex-1 h-10 justify-center relative overflow-hidden"
          >
            {/* background bars */}
            <View className="absolute left-0 right-0 top-0 bottom-0 flex-row items-center">
              {renderBars("#E5E7EB")}
            </View>

            {/* progress overlay */}
            <Animated.View
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: progressWidth,
                overflow: "hidden",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {renderBars("#22C55E")}
            </Animated.View>

            {/* tracker */}
            <Animated.View
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 3,
                backgroundColor: "#FCEB53",
                transform: [{ translateX: progressTranslateX }],
              }}
            />
          </View>
        </View>

        <Text className="text-xs text-gray-800">{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

export default AudioMessage;
