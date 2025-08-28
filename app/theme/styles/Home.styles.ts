import { StyleSheet } from "react-native";
import { colors } from "../colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    width: "100%",
    backgroundColor: colors.primary[500],
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  topBarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  heroSection: {
    padding: 20,
    paddingTop: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    color: colors.gray[900],
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 24,
  },
  buttonGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  section: {
    padding: 20,
  },
  featuresSection: {
    backgroundColor: colors.gray[100],
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: colors.gray[900],
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: colors.gray[600],
  },
  cardsContainer: {
    gap: 16,
  },
  featureCard: {
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.gray[900],
  },
  cardDescription: {
    fontSize: 14,
    color: colors.gray[600],
  },
  featuresList: {
    marginTop: 16,
    gap: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.gray[900],
  },
  featureDescription: {
    fontSize: 14,
    color: colors.gray[600],
  },
  testimonialContainer: {
    paddingRight: 20,
    gap: 16,
  },
  testimonialCard: {
    width: 300,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  testimonialText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray[900],
  },
  ctaSection: {
    padding: 24,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    margin: 20,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    textAlign: "center",
    marginBottom: 24,
  },
  textLight: {
    color: colors.white,
  },
  textMutedLight: {
    color: colors.gray[300],
  },
});
