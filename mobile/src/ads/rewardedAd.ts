import {
    RewardedAd,
    TestIds
} from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-1665828711086363/4578870803"; // replace later

export const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});
