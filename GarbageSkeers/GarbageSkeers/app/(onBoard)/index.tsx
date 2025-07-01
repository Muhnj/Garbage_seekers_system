import Onboarding from "@/components/onBoarding";
import { ONBOARDING_SLIDES } from "@/constants/onboarding";
import { View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Onboarding slides={ONBOARDING_SLIDES}/>
    </View>
  );
}
