import { StyleSheet } from "react-native";
import { colors } from "../colors";

export const vehicleFormStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
    color: colors.primary[500],
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[100],
  },
  imageLabel: {
    marginTop: 8,
    color: colors.gray[500],
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
    color: colors.gray[900],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    backgroundColor: colors.gray[50],
    color: colors.gray[900],
  },
});
