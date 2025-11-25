import { toastError, toastSuccess } from '@/lib/toast';
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import { useVoiceStore } from "@/stores/voiceStore";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import React, { useEffect } from "react";
import { Text, TextInput, View } from "react-native";
import VoiceRecorderButton from "../../general/VoiceRecorderButton";

const MessageToProvider = () => {
  const message = useServiceFlowStore((s) => s.draft.message || "");
  const setMessage = useServiceFlowStore((s) => s.setMessage);

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
      const uri = audioRecorder.uri;
      if (uri) {
        // persist recording URI in both voiceStore (global) and service flow attachments
        useVoiceStore.getState().addRecording(uri);
        useServiceFlowStore.getState().addAttachment(uri);
      }
      toastSuccess('Recording saved', uri ?? 'No URI found');
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
      if (!status.granted) toastError('Permission denied', 'Permission to access microphone was denied');

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
        onChangeText={(t) => setMessage(t)}
        multiline
      />

      <Text className="text-base font-medium mt-5 mb-2">Record a Voice note</Text>
      <VoiceRecorderButton handleRecordVoice={handleRecordVoice} isRecording={recorderState.isRecording} />
    </View>
  );
};

export default MessageToProvider;
