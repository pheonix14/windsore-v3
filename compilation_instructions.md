# Compilation & Build Instructions - WINDSORE Android Browser

This guide outlines the exact steps for **PHEONIX14** to set up, install, run, and compile the **WINDSORE** browser codebase into a working Android APK.

---

## 1. Prerequisites

Ensure you have the following installed on your developer machine:
- **Node.js** (LTS version, v18 or v20 recommended)
- **Git** (if checking out or pulling revisions)
- **Java Development Kit (JDK 17)** (if running native builds locally)
- **Android Studio** & **SDK Command Line Tools** (if deploying locally)
- **Expo account** (sign up at [expo.dev](https://expo.dev) for cloud compilation)

---

## 2. Environment Setup & Project Initialization

Navigate to the `windsore-app` directory and install the package dependencies.

```powershell
# Navigate to the windsore-app folder
cd c:\Users\acer\Desktop\xtreme\windsore-app

# Install project dependencies securely
npm install
```

---

## 3. Running & Testing Locally

Before building the production APK, you can test the application locally in an Android emulator or on a physical Android device connected via USB with USB Debugging enabled.

### Run on Android Emulator / Physical Device
```powershell
# Start the Expo Dev Server and auto-run on Android
npm run android
```
*Note: Make sure your emulator is running or device is connected via `adb devices` before launching.*

---

## 4. Compiling to a Production-Ready APK (Via Expo EAS)

We use **Expo Application Services (EAS)** to compile the code in the cloud, removing the need for a local Android build toolchain.

### Step A: Install the EAS Command Line Interface
```powershell
npm install -g eas-cli
```

### Step B: Login to your Expo Developer Account
```powershell
eas login
```

### Step C: Initialize the EAS Build Configuration
This command will create an `eas.json` file in your root folder.
```powershell
eas build:configure
```
*When prompted for platforms, select **Android**.*

### Step D: Configure APK Output Profile
Open the newly created `eas.json` and ensure it is configured to produce an **APK file** rather than an `.aab` bundle (so you can install it directly on devices). Modify the `preview` profile to include `buildType: "apk"`:

```json
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### Step E: Run the Cloud Compilation Command
Execute the compilation command:
```powershell
eas build -p android --profile preview
```

### Step F: Install the Compiled APK
Once the EAS build finishes (typically 3-7 minutes), EAS will display a direct link to download the compiled `.apk` file. 
- Download the APK to your device.
- Or install it directly using ADB if your device is plugged in:
  ```powershell
  adb install -r <path-to-downloaded-windsore-preview.apk>
  ```
