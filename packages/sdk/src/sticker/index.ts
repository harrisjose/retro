export enum StickType {
  StarStruck = "star-struck",
  ClinkingBeerMugs = "clinking-beer-mugs",
  FaceInClouds = "face-in-clouds",
  Skull = "skull",
  BottleWithPoppingCork = "bottle-with-popping-cork",
  Poop = "poop",
}

export const StickerJsonMap = {
  [StickType.StarStruck]: {
    name: "Star Struck",
    json: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f929/lottie.json",
  },
  [StickType.ClinkingBeerMugs]: {
    name: "Clinking Beer Mugs",
    json: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37b/lottie.json",
  },
  [StickType.FaceInClouds]: {
    name: "Face in Clouds",
    json: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f636_200d_1f32b_fe0f/lottie.json",
  },
  [StickType.Skull]: {
    name: "Skull",
    json: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f480/lottie.json",
  },
  [StickType.BottleWithPoppingCork]: {
    name: "Bottle with Popping Cork",
    json: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f37e/lottie.json",
  },
  [StickType.Poop]: {
    name: "Poop",
    json: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a9/lottie.json",
  },
};
