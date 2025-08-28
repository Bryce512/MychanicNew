import { StyleSheet } from "react-native";

export const buttonStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    gap: 8,
  },
  outline: {
    borderWidth: 1,
  },
  text: {
    fontWeight: "600",
  },
  fullWidth: {
    width: "100%",
  },
});
