const fs = require("fs");
const path = require("path");

const appJson = require("./app.json");

const headingFontPath = "./assets/fonts/FazendioHeading.ttf";
const absoluteHeadingFontPath = path.join(__dirname, "assets", "fonts", "FazendioHeading.ttf");

function withAndroidHeadingFont(config) {
  if (!fs.existsSync(absoluteHeadingFontPath)) {
    return config;
  }

  const fontPlugin = [
    "expo-font",
    {
      android: {
        fonts: [
          {
            fontFamily: "FazendioHeading",
            fontDefinitions: [
              {
                path: headingFontPath,
                weight: 700,
              },
            ],
          },
        ],
      },
    },
  ];

  return {
    ...config,
    expo: {
      ...config.expo,
      plugins: [config.expo.plugins[0], fontPlugin, ...config.expo.plugins.slice(1)],
    },
  };
}

module.exports = withAndroidHeadingFont(appJson);
