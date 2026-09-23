import { useRef, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { usePet, type Photo } from "../lib/store";
import { Body, Button, Card, Notice, s } from "./ui";

export function PhotoInput({
  photos,
  updatePhotos,
  loading,
  required = false,
}: {
  photos: Photo[];
  updatePhotos: (photos: Photo[]) => void;
  loading: boolean;
  required?: boolean;
}) {
  const { revision } = usePet();
  const [picking, setPicking] = useState(false);
  const pickGeneration = useRef(0);
  const [photoError, setPhotoError] = useState("");
  async function pick() {
    if (picking || photos.length >= 8) return;
    setPicking(true);
    setPhotoError("");
    const version = revision.current;
    const generation = ++pickGeneration.current;
    try {
      // Launch directly from the user gesture so the web file picker is not blocked.
      const selected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 8 - photos.length,
        quality: 0.8,
      });
      if (selected.canceled || generation !== pickGeneration.current) return;
      const available = selected.assets.slice(0, 8 - photos.length);
      const next: Photo[] = [];
      for (const asset of available) {
        if (photos.some((p) => p.id === (asset.assetId || asset.uri))) continue;
        if (!(asset.width > 0 && asset.height > 0))
          throw new Error(
            "This photo could not be decoded. Please choose a JPEG or PNG image.",
          );
        const normalized = await manipulateAsync(
          asset.uri,
          [
            {
              resize:
                asset.width >= asset.height
                  ? { width: Math.min(asset.width, 1280) }
                  : { height: Math.min(asset.height, 1280) },
            },
          ],
          { compress: 0.7, format: SaveFormat.JPEG, base64: true },
        );
        if (!normalized.base64 || normalized.base64.length > 1_499_900)
          throw new Error("One image is too large. Choose a smaller photo.");
        next.push({
          id: asset.assetId || asset.uri,
          uri: normalized.uri,
          data: `data:image/jpeg;base64,${normalized.base64}`,
        });
      }
      if (generation !== pickGeneration.current) return;
      if (version !== revision.current) {
        setPhotoError(
          "Details changed while picking photos. Please add the photos again.",
        );
        return;
      }
      updatePhotos([...photos, ...next]);
      if (selected.assets.length > available.length)
        setPhotoError(
          "Only the first photos that fit the 8-photo limit were added.",
        );
    } catch (e) {
      if (generation !== pickGeneration.current) return;
      setPhotoError(
        e instanceof Error
          ? e.message
          : "Photos could not be opened. Check photo permissions in your device settings.",
      );
    } finally {
      if (generation === pickGeneration.current) setPicking(false);
    }
  }
  return (
    <Card title={`Photos (${photos.length}/8)`}>
      <Body>
        Choose clear photos of the same pet from this episode. Include posture,
        face, and the surroundings. Photos are not saved in your history; they
        are sent only when you tap Analyze. Temporary device caches may remain.
      </Body>
      <View style={[s.row, { marginTop: 16 }]}>
        {photos.map((photo, index) => (
          <View key={photo.id} style={{ width: "47%", minWidth: 100 }}>
            <Image
              accessibilityLabel={`Photo ${index + 1}`}
              source={{ uri: photo.uri }}
              style={{ width: "100%", aspectRatio: 1, borderRadius: 16 }}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={s.label}>Photo {index + 1}</Text>
              <Pressable
                disabled={loading || picking}
                accessibilityRole="button"
                accessibilityLabel={`Remove photo ${index + 1}`}
                onPress={() =>
                  updatePhotos(photos.filter((p) => p.id !== photo.id))
                }
                style={{ padding: 14 }}
              >
                <Text style={{ color: "#982D43", fontWeight: "700" }}>
                  Remove
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <Button
        title={
          picking
            ? "Preparing photos…"
            : photos.length === 8
              ? "8 photos added"
              : "＋ Add photos"
        }
        secondary
        loading={picking}
        disabled={picking || loading || photos.length >= 8}
        onPress={pick}
      />
      {picking && (
        <Button
          title="Cancel photo selection"
          secondary
          onPress={() => {
            pickGeneration.current++;
            setPicking(false);
          }}
        />
      )}
      {required && photos.length === 0 && (
        <Body>Add at least 1 photo to get started.</Body>
      )}
      {!!photoError && <Notice danger>{photoError}</Notice>}
    </Card>
  );
}
