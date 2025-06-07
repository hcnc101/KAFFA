import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
} from "react-native";
import { Text, Icon, Button, Image } from "@rneui/themed";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

const SCREEN_WIDTH = Dimensions.get("window").width;

const theme = {
  primary: "#8B4513",
  secondary: "#C4A484",
  background: "#FFFFFF",
  surface: "#F5F5F5",
  text: "#333333",
  textLight: "#666666",
};

const filters = [
  { name: "Original", filter: "" },
  { name: "Latte", filter: "sepia(0.5)" },
  { name: "Espresso", filter: "contrast(1.2) brightness(0.8)" },
  { name: "Mocha", filter: "saturate(1.5) contrast(1.1)" },
  { name: "Cold Brew", filter: "brightness(1.1) saturate(0.8)" },
];

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(filters[0]);
  const [caption, setCaption] = useState("");
  const cameraRef = useRef<Camera | null>(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const onCameraReady = () => {
    setIsCameraReady(true);
  };

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      const options = { quality: 0.5, base64: true };
      const photo = await cameraRef.current.takePictureAsync(options);
      const source = photo.uri;
      if (source) {
        await cameraRef.current.pausePreview();
        setIsPreview(true);
        setCapturedImage(source);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedImage(result.assets[0].uri);
      setIsPreview(true);
    }
  };

  const retakePicture = async () => {
    if (cameraRef.current) {
      await cameraRef.current.resumePreview();
      setIsPreview(false);
      setCapturedImage(null);
      setSelectedFilter(filters[0]);
      setCaption("");
    }
  };

  const toggleCameraType = () => {
    setType(
      type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };

  const toggleFlash = () => {
    setFlash(
      flash === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.on
        : Camera.Constants.FlashMode.off
    );
  };

  const renderCaptureControl = () => (
    <View style={styles.captureControl}>
      <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
        <Icon name="photo-library" color="white" size={28} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.captureButton}
        onPress={takePicture}
        disabled={!isCameraReady}
      >
        <View style={styles.captureInner} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cameraFlipButton}
        onPress={toggleCameraType}
      >
        <Icon name="flip-camera-ios" color="white" size={28} />
      </TouchableOpacity>
    </View>
  );

  const renderCameraControls = () => (
    <View style={styles.cameraControls}>
      <TouchableOpacity style={styles.flashButton} onPress={toggleFlash}>
        <Icon
          name={
            flash === Camera.Constants.FlashMode.on ? "flash-on" : "flash-off"
          }
          color="white"
          size={24}
        />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filtersContainer}
    >
      {filters.map((filter, index) => (
        <TouchableOpacity
          key={filter.name}
          style={[
            styles.filterOption,
            selectedFilter.name === filter.name && styles.filterSelected,
          ]}
          onPress={() => setSelectedFilter(filter)}
        >
          {capturedImage && (
            <Image
              source={{ uri: capturedImage }}
              style={[styles.filterPreview, { transform: [{ scale: 0.3 }] }]}
            />
          )}
          <Text style={styles.filterName}>{filter.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPreview = () => (
    <View style={styles.previewContainer}>
      <Image source={{ uri: capturedImage }} style={styles.previewImage} />
      <View style={styles.previewControls}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor={theme.textLight}
          value={caption}
          onChangeText={setCaption}
          multiline
        />
        {renderFilters()}
        <View style={styles.previewButtons}>
          <Button
            title="Retake"
            onPress={retakePicture}
            buttonStyle={styles.retakeButton}
            titleStyle={styles.retakeButtonText}
          />
          <Button
            title="Share"
            onPress={() => {
              /* Handle sharing */
            }}
            buttonStyle={styles.shareButton}
            titleStyle={styles.shareButtonText}
            icon={{
              name: "send",
              type: "material",
              size: 20,
              color: "white",
            }}
            iconRight
          />
        </View>
      </View>
    </View>
  );

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isPreview && capturedImage ? (
        renderPreview()
      ) : (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={type}
            flashMode={flash}
            onCameraReady={onCameraReady}
          >
            {renderCameraControls()}
          </Camera>
          {renderCaptureControl()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureControl: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  galleryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraFlipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  previewControls: {
    flex: 1,
    padding: 15,
  },
  captionInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
    color: "white",
    marginBottom: 15,
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  filterOption: {
    alignItems: "center",
    marginRight: 15,
    opacity: 0.7,
  },
  filterSelected: {
    opacity: 1,
  },
  filterPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  filterName: {
    color: "white",
    fontSize: 12,
  },
  previewButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  retakeButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: "white",
  },
  shareButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  shareButtonText: {
    color: "white",
    marginRight: 8,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionText: {
    color: theme.text,
    fontSize: 16,
  },
});

export default CameraScreen;
