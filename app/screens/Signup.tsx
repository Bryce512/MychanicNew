"use client";

import { useState } from "react";
import { StatusBar } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Button from "../components/Button";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../theme/colors";
import { signupStyles } from "../theme/styles/Signup.styles";

export default function SignupScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error, user } = await signUp(email, password);

      if (error) {
        Alert.alert("Error", error.message);
      } else if (user) {
        // User successfully created and signed in
        Alert.alert("Success", "Account created successfully!");
        navigation.navigate("Home" as never); // Navigate to Home instead of Login
      } else {
        // Handle the case where signup requires email verification
        Alert.alert("Success", "Please check your email for verification!");
        navigation.navigate("Login" as never);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={signupStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={signupStyles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={signupStyles.scrollContainer}>
          <View style={signupStyles.logoContainer}>
            <Feather name="tool" size={40} color={colors.primary[500]} />
            <Text
              style={[signupStyles.logoText, isDark && signupStyles.textLight]}
            >
              Mychanic
            </Text>
          </View>

          <Text style={[signupStyles.title, isDark && signupStyles.textLight]}>
            Create Account
          </Text>
          <Text
            style={[
              signupStyles.subtitle,
              isDark && signupStyles.textMutedLight,
            ]}
          >
            Sign up to get started with Mychanic
          </Text>

          <View style={signupStyles.form}>
            <View style={signupStyles.inputContainer}>
              <Text
                style={[
                  signupStyles.inputLabel,
                  isDark && signupStyles.textLight,
                ]}
              >
                Email
              </Text>
              <View style={signupStyles.inputWrapper}>
                <Feather
                  name="mail"
                  size={18}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                  style={signupStyles.inputIcon}
                />
                <TextInput
                  style={[
                    signupStyles.input,
                    isDark && signupStyles.inputDark,
                    { paddingLeft: 40 },
                  ]}
                  placeholder="Enter your email"
                  placeholderTextColor={
                    isDark ? colors.gray[400] : colors.gray[500]
                  }
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={signupStyles.inputContainer}>
              <Text
                style={[
                  signupStyles.inputLabel,
                  isDark && signupStyles.textLight,
                ]}
              >
                Password
              </Text>
              <View style={signupStyles.inputWrapper}>
                <Feather
                  name="lock"
                  size={18}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                  style={signupStyles.inputIcon}
                />
                <TextInput
                  style={[
                    signupStyles.input,
                    isDark && signupStyles.inputDark,
                    { paddingLeft: 40, paddingRight: 40 },
                  ]}
                  placeholder="Create a password"
                  placeholderTextColor={
                    isDark ? colors.gray[400] : colors.gray[500]
                  }
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={signupStyles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={isDark ? colors.gray[400] : colors.gray[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={signupStyles.inputContainer}>
              <Text
                style={[
                  signupStyles.inputLabel,
                  isDark && signupStyles.textLight,
                ]}
              >
                Confirm Password
              </Text>
              <View style={signupStyles.inputWrapper}>
                <Feather
                  name="lock"
                  size={18}
                  color={isDark ? colors.gray[400] : colors.gray[500]}
                  style={signupStyles.inputIcon}
                />
                <TextInput
                  style={[
                    signupStyles.input,
                    isDark && signupStyles.inputDark,
                    { paddingLeft: 40 },
                  ]}
                  placeholder="Confirm your password"
                  placeholderTextColor={
                    isDark ? colors.gray[400] : colors.gray[500]
                  }
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            <Button
              title="Sign Up"
              onPress={handleSignup}
              loading={loading}
              fullWidth
              style={signupStyles.signupButton}
            />

            <View style={signupStyles.divider}>
              <View
                style={[
                  signupStyles.dividerLine,
                  isDark && signupStyles.dividerLineDark,
                ]}
              />
              <Text
                style={[
                  signupStyles.dividerText,
                  isDark && signupStyles.textMutedLight,
                ]}
              >
                OR
              </Text>
              <View
                style={[
                  signupStyles.dividerLine,
                  isDark && signupStyles.dividerLineDark,
                ]}
              />
            </View>

            <Button
              title="Sign Up as Mechanic"
              onPress={() => navigation.navigate("MechanicSignup" as never)}
              variant="outline"
              fullWidth
              style={signupStyles.mechanicButton}
            />

            <Button
              title="Complete Driver Onboarding"
              onPress={() => navigation.navigate("DriverOnboarding" as never)}
              variant="secondary"
              fullWidth
            />
          </View>

          <View style={signupStyles.footer}>
            <Text
              style={[
                signupStyles.footerText,
                isDark && signupStyles.textMutedLight,
              ]}
            >
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login" as never)}
            >
              <Text
                style={[
                  signupStyles.loginText,
                  isDark && { color: colors.primary[400] },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
  // StatusBar for all screens except Home
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" />
      {/* ...existing code... */}
    </>
  );
}
