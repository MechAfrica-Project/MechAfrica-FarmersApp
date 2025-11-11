import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import React, { useEffect } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import VoiceRecorderButton from "../../general/VoiceRecorderButton";

const MessageToProvider = () => {
  const [message, setMessage] = React.useState("");

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
      Alert.alert("Recording saved", audioRecorder.uri ?? "No URI found");
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  const handleRecordVoice = async () => {
    if (recorderState.isRecording) await stopRecording();
    else await startRecording();
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) Alert.alert("Permission to access microphone was denied");

      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  return (
    <View className="flex-1 mt-6">
      <Text className="text-base font-medium text-black mb-2">Message to Provider</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 text-[15px] min-h-[100px] bg-gray-50 text-black"
        placeholder="Type a message"
        placeholderTextColor="#999"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Text className="text-base font-medium mt-5 mb-2">Record a Voice note</Text>
      <VoiceRecorderButton handleRecordVoice={handleRecordVoice} isRecording={recorderState.isRecording} />
    </View>
  );
};

export default MessageToProvider;
