import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useEffect } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import VoiceRecorderButton from "../../general/VoiceRecorderButton";

const MessageToProvider = () => {
  const [message, setMessage] = React.useState("");

  // setup recorder
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const startRecording = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error("Error starting recording:", err);
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      console.log("Recording saved at:", audioRecorder.uri);
      Alert.alert("Recording saved", audioRecorder.uri ?? "No URI found");
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  const handleRecordVoice = async () => {
    if (recorderState.isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // ask for permissions + audio mode setup
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
      });
    })();
  }, []);

  return (
    <View className="flex-1">
      {/* Message to Provider */}
      <Text className="text-base font-mulish font-medium text-black mb-2">
        Message to Provider
      </Text>
      <TextInput
        className="border border-gray-300 font-mulish rounded-lg p-3 text-[15px] min-h-[100px] text-black bg-gray-50"
        placeholder="Type a message"
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      {/* Record a Voice note */}
      <Text className="text-base font-mulish font-medium mt-5 mb-2">
        Record a Voice note
      </Text>

      {/* 🎤 Reusable Voice Recorder Button with Ripple Echo */}
      <VoiceRecorderButton
        handleRecordVoice={handleRecordVoice}
        isRecording={recorderState.isRecording}
      />
    </View>
  );
};

export default MessageToProvider;
