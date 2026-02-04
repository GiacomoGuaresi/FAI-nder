const pkg = require('./package.json');

module.exports = {
  expo: {
    name: "FAIder",
    slug: "FAIder",
    version: pkg.version,

    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "fainder",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    jsEngine: "hermes",

    updates: {
      enabled: false
    },

    ios: {
      supportsTablet: true
    },

    android: {
      package: "com.jack_up98.fainder",
      versionCode: Number(process.env.ANDROID_VERSION_CODE || 1),
      icon: "./assets/images/icon.png",

      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      fileSystemAuthority: "com.jack_up98.fainder.filesystem"
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ]
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    extra: {
      eas: {
        projectId: "2901ca88-27e2-4070-b8ea-3f9b77de1994"
      }
    }
  }
};
