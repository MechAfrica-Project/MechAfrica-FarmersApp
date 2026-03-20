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
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

interface AudioMessageProps {
  voiceNoteUrl?: string | null;
}

const BAR_WIDTH = 3;
const BAR_MARGIN = 2;
const NUM_BARS = 40;

const AudioMessage = ({ voiceNoteUrl }: AudioMessageProps) => {
  const [waveformWidth, setWaveformWidth] = useState(0);
  const [waveformX, setWaveformX] = useState(0);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);

  const player = useAudioPlayer(voiceNoteUrl ? { uri: voiceNoteUrl } : null);
  const status = useAudioPlayerStatus(player);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const waveformRef = useRef<View | null>(null);

  const bars = useRef<number[]>(
    Array.from({ length: NUM_BARS }, () => 8 + Math.random() * 24)
  ).current;

  const isPlaying = status.playing;
  const isLoading = !status.isLoaded;
  const position = (status.currentTime ?? 0) * 1000; // seconds → ms
  const duration = (status.duration ?? 0.001) * 1000; // seconds → ms

  const formatTime = (millis: number) => {
    const totalSec = Math.floor(millis / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
  };

  // Animate waveform pulse while playing
  useEffect(() => {
    if (isPlaying) {
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
    } else {
      waveAnim.stopAnimation();
      waveAnim.setValue(0);
    }
  }, [isPlaying, waveAnim]);

  // Sync progress bar with playback position
  useEffect(() => {
    if (dragProgress === null && duration > 0) {
      progressAnim.setValue(position / duration);
    }
  }, [position, duration, dragProgress, progressAnim]);

  const playOrPauseAudio = () => {
    if (!voiceNoteUrl || !player) return;
    if (isPlaying) {
      player.pause();
    } else {
      // If playback has reached the end (within 100ms), auto-rewind to start
      if (position >= duration - 100) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const onWaveformLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWaveformWidth(w);
    waveformRef.current?.measure((_x, _y, _width, _height, pageX) => {
      setWaveformX(pageX);
    });
  };

  const seekTo = (progress: number) => {
    if (!player || duration === 0) return;
    const clamped = Math.max(0, Math.min(progress, 1));
    const newPositionSec = (clamped * duration) / 1000; // ms → seconds
    player.seekTo(newPositionSec);
    progressAnim.setValue(clamped);
  };

  const handleDrag = (e: GestureResponderEvent) => {
    if (waveformWidth === 0) return;
    const pageX = e.nativeEvent.pageX;
    const x = Math.max(0, Math.min(pageX - waveformX, waveformWidth));
    const progress = waveformWidth > 0 ? x / waveformWidth : 0;
    setDragProgress(progress);
    progressAnim.setValue(progress);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setWasPlayingBeforeDrag(isPlaying);
        if (player && isPlaying) {
          player.pause();
        }
        handleDrag(e);
      },
      onPanResponderMove: (e) => handleDrag(e),
      onPanResponderRelease: () => {
        if (dragProgress !== null) {
          seekTo(dragProgress);
          setDragProgress(null);
          if (wasPlayingBeforeDrag && player) {
            player.play();
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
