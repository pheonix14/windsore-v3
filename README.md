# Windsore V3

Welcome to **Windsore V3**, the ultra-modern, privacy-focused, bare-metal React Native Android browser. 

Windsore V3 takes inspiration from the best features of *Via Browser*, *Safari*, and *Kiwi Browser*, merging them into a sleek glassmorphic UI driven by the latest web technologies.

## 🌟 Key Features

*   **Hybrid Safari/Kiwi/Via Interface:** A compact, beautiful bottom control dock heavily inspired by Safari's layout, combined with the extreme speed of Via Browser. Features a dark mode UI with glassmorphism elements.
*   **Windsore Dev Hub:** A hidden developer dashboard with real-time status monitoring, server loads, and a live HTML Code Editor & Runner! Test JS and HTML snippets by injecting them directly into your active browser tab.
*   **Enhanced Typography:** Employs premium Google Fonts (Space Grotesk, Playfair Display, Dancing Script) for an aesthetic, high-end feel.
*   **Privacy First:** Built-in ad-blocking, tracking protection, custom PC User-Agent spoofing, and standard browser Settings (Clear Cache, Toggle JS, DNT).
*   **Burn Protocol:** The ultimate privacy feature. A single tap to wipe all storage, session data, vaults, and terminate the application securely.

## 🚀 Getting Started

Windsore V3 is built on **React Native 0.74 (Bare Workflow)** and **Expo SDK 51**.

### Prerequisites

*   Node.js (v18+)
*   Android Studio / Android SDK (for building the APK)
*   Java 17

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/PHEONIX14/windsore-v3.git
   cd windsore-v3
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run Metro Bundler:
   \`\`\`bash
   npm run start
   \`\`\`

4. Build for Android:
   \`\`\`bash
   npm run android
   \`\`\`
   *Or generate a release APK:*
   \`\`\`bash
   cd android && ./gradlew assembleRelease
   \`\`\`

## 🛠️ Architecture

*   **Engine:** `react-native-webview`
*   **Icons:** `@expo/vector-icons` (Feather)
*   **Fonts:** `@expo-google-fonts`
*   **UI System:** Vanilla React Native Stylesheets (Flexbox, Glassmorphism)

---
*Developed by PHEONIX14*
