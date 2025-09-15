import { StyleSheet } from "react-native";
import { colors } from "../colors";

export const styles = StyleSheet.create({
  notesInputDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
    color: colors.white,
  },
  dateTimeContainer: {
    flexDirection: "column",
  },
  dateSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  calendarPlaceholder: {
    height: 300,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  calendarPlaceholderDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  calendarPlaceholderText: {
    color: colors.gray[500],
  },
  timeSection: {
    marginTop: 16,
  },
  timeSlotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeSlot: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    backgroundColor: colors.white,
    minWidth: "48%",
  },
  timeSlotDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  unavailableTimeSlot: {
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },
  unavailableTimeSlotDark: {
    borderColor: colors.gray[800],
    backgroundColor: colors.gray[900],
    opacity: 0.6,
  },
  selectedTimeSlot: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  selectedTimeSlotDark: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  timeSlotText: {
    fontSize: 14,
    color: colors.gray[900],
  },
  unavailableTimeSlotText: {
    color: colors.gray[400],
  },
  unavailableTimeSlotTextDark: {
    color: colors.gray[600],
  },
  selectedTimeSlotText: {
    color: colors.white,
  },
  confirmationHeader: {
    alignItems: "center",
  },
  confirmationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.green[500] + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.gray[900],
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
  },
  confirmationDetails: {
    marginBottom: 16,
  },
  detailsCard: {
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.white,
  },
  detailsCardDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray[600],
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  obdCard: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.white,
  },
  obdCardDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  obdCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  obdCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  obdCardText: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 12,
  },
  obdStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  topBar: {
    width: "100%",
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  topBarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary[500],
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: "center",
  },
  textLight: {
    color: colors.white,
  },
  textMutedLight: {
    color: colors.gray[400],
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    width: 70,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
    marginBottom: 4,
  },
  vehicleSubtext: {
    fontSize: 14,
    color: colors.gray[600],
  },
  obdBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  obdText: {
    fontSize: 12,
    color: colors.green[500],
  },
  cardFooter: {
    justifyContent: "space-between",
  },
  tabsContainer: {},
  tabsHeader: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  tabButtonDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  activeTabButton: {
    backgroundColor: colors.primary[500],
  },
  activeTabButtonDark: {
    backgroundColor: colors.primary[500],
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  activeTabButtonText: {
    color: colors.white,
  },
  serviceOptions: {},
  serviceOption: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  serviceOptionDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  otherServiceOption: {
    borderStyle: "dashed",
  },
  otherServiceOptionDark: {
    borderStyle: "dashed",
  },
  selectedServiceOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  selectedServiceOptionDark: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[900] + "30",
  },
  serviceDetails: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  servicePrice: {
    fontSize: 16,
    color: colors.gray[900],
  },
  serviceDuration: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  serviceSubtext: {
    fontSize: 14,
    color: colors.gray[600],
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
  },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    height: 100,
    backgroundColor: colors.white,
  },
  activeStepCircle: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  stepCircleDark: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[700],
  },
  activeStepCircleDark: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  stepNumber: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: "bold",
  },
  activeStepNumber: {
    color: colors.white,
    backgroundColor: colors.primary[500],
  },
  stepLabel: {
    fontSize: 12,
    color: colors.gray[600],
    marginTop: 4,
    textAlign: "center",
  },
  activeStepLabel: {
    color: colors.primary[500],
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.gray[900],
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: 8,
  },
  vehicleOptions: {
    flexDirection: "column",

    marginBottom: 16,
  },
  vehicleOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  selectedVehicleOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  vehicleOptionDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  selectedVehicleOptionDark: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[900] + "30",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[400],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  radioOuterDark: {
    borderColor: colors.gray[700],
    backgroundColor: colors.gray[800],
  },
  radioOuterSelected: {
    borderColor: colors.primary[500],
  },
  radioOuterSelectedDark: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  radioInnerDark: {
    backgroundColor: colors.primary[500],
  },
  vehicleDetails: {
    flex: 1,
    marginLeft: 8,
  },
  newVehicleOption: {
    borderStyle: "dashed",
  },
  newVehicleOptionDark: {
    borderStyle: "dashed",
  },
  obdStatusLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[900],
    marginRight: 8,
  },
  obdStatusValue: {
    fontSize: 14,
    color: colors.green[500],
    fontWeight: "bold",
  },
  confirmationFooter: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  confirmationFooterText: {
    fontSize: 14,
    color: colors.gray[600],
    textAlign: "center",
    marginBottom: 16,
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  confirmationButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});
