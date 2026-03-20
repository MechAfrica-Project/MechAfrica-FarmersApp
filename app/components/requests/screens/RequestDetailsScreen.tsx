import React, { useState, useEffect } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RequestDetailsCard from "../reusable/RequestDetailsCard";
import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import { View, Text, TextInput, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { X, Trash2 } from "lucide-react-native";
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import VoiceRecorderButton from "../../general/VoiceRecorderButton";
import { toastError, toastSuccess } from '@/lib/toast';

const RequestDetailsScreen = () => {
  const router = useRouter();
  const { request } = useLocalSearchParams();
  const paramRequest: Request | null = request ? JSON.parse(request as string) : null;
  
  // Real-time access to request overrides local search params
  const liveRequest = useRequestsStore((s) => paramRequest ? s.byId[paramRequest.id] : null) || paramRequest;
  
  const cancelRequest = useRequestsStore((s) => s.cancelRequest);
  const updateRequestDetails = useRequestsStore((s) => s.updateRequestDetails);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState("");
  const [voiceNoteUri, setVoiceNoteUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) toastError('Permission denied', 'Permission to access microphone was denied');
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    })();
  }, []);

  // Initialize edit fields
  useEffect(() => {
    if (isEditing && liveRequest) {
      setEditComment(liveRequest.messageFromFarmer || "");
      setVoiceNoteUri(liveRequest.voiceNoteUrl || null);
    }
  }, [isEditing, liveRequest]);

  if (!liveRequest) return null;

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
        setVoiceNoteUri(uri);
        toastSuccess('Recording captured', 'Audio is ready to save.');
      }
    } catch (err) {
      console.error("Error stopping recording:", err);
    }
  };

  const handleRecordVoice = async () => {
    if (recorderState.isRecording) await stopRecording();
    else await startRecording();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateRequestDetails(liveRequest.id, editComment, voiceNoteUri);
      toastSuccess("Success", "Request details updated");
      setIsEditing(false);
    } catch (error: any) {
      toastError("Failed to update", error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <RequestDetailsCard
        request={liveRequest}
        type={liveRequest.status}
        showActions
        onCancel={() => {
          cancelRequest(liveRequest.id);
          router.replace({
            pathname: "/components/requests/screens/CancelledDetailsScreen",
            params: {
              request: JSON.stringify({ ...liveRequest, status: "cancelled" }),
            },
          });
        }}
        onEdit={() => setIsEditing(true)}
      />

      {/* Edit Modal / Elite Brand Styling */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditing(false)}
      >
        <View className="flex-1 bg-[#0A0F24]/60 justify-end">
          <View className="bg-white/95 rounded-t-[36px] px-6 pt-8 pb-12 shadow-2xl border-t border-white/20">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-[#131A2A] tracking-tight">Edit Context</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)} className="bg-slate-100/80 p-2.5 rounded-full border border-slate-200/50">
                <X color="#475569" size={20} />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Provide Explanation</Text>
            <TextInput
              className="border border-slate-200/60 rounded-2xl p-4 text-[16px] min-h-[120px] bg-slate-50/50 text-[#131A2A] mb-6 font-medium shadow-sm w-full"
              placeholder="Provide more context (optional)"
              placeholderTextColor="#94A3B8"
              value={editComment}
              onChangeText={setEditComment}
              multiline
              textAlignVertical="top"
            />

            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Voice Explanation</Text>
              {voiceNoteUri && (
                <TouchableOpacity onPress={() => setVoiceNoteUri(null)} className="flex-row items-center bg-red-50/80 px-3 py-1.5 rounded-xl border border-red-100">
                  <Trash2 color="#EF4444" size={14} />
                  <Text className="text-red-500 font-semibold ml-1.5 text-sm tracking-tight">Remove Audio</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View className="bg-emerald-50/40 rounded-3xl py-7 mb-8 border border-emerald-100/50 items-center justify-center">
              <VoiceRecorderButton handleRecordVoice={handleRecordVoice} isRecording={recorderState.isRecording} />
              <View className="mt-4 h-6 justify-center items-center">
                {recorderState.isRecording ? (
                  <Text key="recording-label" className="text-emerald-600 font-semibold tracking-tight text-[15px]">Recording in progress...</Text>
                ) : voiceNoteUri ? (
                  <Text key="ready-label" className="text-emerald-700 font-semibold tracking-tight text-[15px]">Ready to overwrite existing audio</Text>
                ) : (
                  <Text key="idle-label" className="text-slate-400 font-medium tracking-wide text-sm">Tap mic to record a brand new note</Text>
                )}
              </View>
            </View>

            {/* Actions */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`py-4 rounded-2xl items-center shadow-md bg-[#00C389] ${isSaving ? 'opacity-75' : 'opacity-100'}`}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-[17px] tracking-wide">Save Request Details</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default RequestDetailsScreen;
