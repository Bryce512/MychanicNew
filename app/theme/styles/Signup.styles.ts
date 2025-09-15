import { StyleSheet } from "react-native";
import { colors } from "../colors";

export const signupStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    gap: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.gray[900],
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: colors.gray[900],
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    color: colors.gray[600],
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  inputWrapper: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 12,
    top: 12,
    zIndex: 1,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    color: colors.gray[900],
  },
  inputDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
    color: colors.white,
  },
  passwordToggle: {
    position: "absolute",
    right: 12,
    top: 12,
    zIndex: 1,
  },
  signupButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray[300],
  },
  dividerLineDark: {
    backgroundColor: colors.gray[700],
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.gray[500],
  },
  mechanicButton: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  loginText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary[500],
  },
  textLight: {
    color: colors.white,
  },
  textMutedLight: {
    color: colors.gray[400],
  },
});
