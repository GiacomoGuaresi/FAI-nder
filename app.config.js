const pkg = require('./package.json');

module.exports = {
  expo: {
    name: "FAI-nder",
    slug: "FAI-nder",
    version: pkg.version,

    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "fainder",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true
    },

    android: {
      package: "com.jack_up98.fainder",
      versionCode: Number(process.env.ANDROID_VERSION_CODE || 1),

      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      buildOptions: {
        kotlinCompilerExtensionVersion: "1.5.8"
      },
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
