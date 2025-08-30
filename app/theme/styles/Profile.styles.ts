import { StyleSheet } from "react-native";
import { colors } from "../colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.primary[500],
  },
  info: {
    fontSize: 16,
    marginBottom: 40,
    color: colors.gray[800],
  },
  logoutButton: {
    backgroundColor: colors.red[500],
    marginTop: 16,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },
});
