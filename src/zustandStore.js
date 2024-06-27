import { create } from "zustand";
import moment from "moment";

const currentDateTime = moment().startOf("minute");
const startDate = currentDateTime
  .clone()
  .subtract(2, "days")
  .startOf("day")
  .format("YYYY-MM-DD HH:mm:ss");
let endDate = currentDateTime.clone();
endDate = endDate
  .subtract(2, "days")
  .endOf("day")
  .format("YYYY-MM-DD HH:mm:ss");

// const endDate1 = newyesterday.format("YYYY-MM-DD HH:mm:ss");

const todayStart = moment().startOf("day").subtract(5, "days");
const todayStartCloned = todayStart.clone();
const endOfDay = todayStartCloned.clone().endOf("day");

// Set the time to 23:59:00

let prevyesterday = moment().subtract(1, "days");

const ClonedPrevYearPrevDay = prevyesterday.clone();

const newPrevYearPrevEndDate = ClonedPrevYearPrevDay.clone()
  .subtract(1, "year")
  .endOf("day")
  .format("YYYY-MM-DD HH:mm:ss");
const newPrevYearStartDate = ClonedPrevYearPrevDay.clone()
  .subtract(1, "year")
  .subtract(1, "day")
  .startOf("day")
  .format("YYYY-MM-DD HH:mm:ss");

// Set the time to 23:59:00
prevyesterday = prevyesterday.endOf("day");

// const endDate1 = yesterday.format("YYYY-MM-DD HH:mm:ss");
const previousYearEndate = prevyesterday.clone().subtract(1, "year");
const previousYearStartDate = prevyesterday
  .clone()
  .subtract(1, "year")
  .subtract(2, "days");

export const useZustandStore = create((set) => ({
  // array of pollutants for dropdown options
  metricsData: [],
  setMetricsData: (metrics) => set({ metricsData: metrics }),

  allLocationsData: [],
  setAllLocationsData: (allLocations) =>
    set({ allLocationsData: allLocations }),

  // pollutant name to be used/selected in the app
  pollutant: "pm2.5",
  setPollutant: (value) => set({ pollutant: value }),

  dropdown: {
    compare: "None",
  },
  setDropDown: (param) =>
    set((state) => ({ dropdown: { ...state.dropdown, ...param } })),

  // global state for ranking params selected from selectors in Ranking page
  rankingParams: {
    pollutant: "PM2.5",
    groupby: "Station",
    startDate: startDate,
    endDate: endDate,
    duration: "Yesterday",
    oldStartDate: newPrevYearStartDate,
    uptime: 0,
    compare: "None",
    oldEndDate: newPrevYearPrevEndDate,
    locations: "",
    graph: "Line Graph",
  },
  SetRankingParams: (param) =>
    set((state) => ({ rankingParams: { ...state.rankingParams, ...param } })),

  // global state for mui alert
  alertOpen: false,
  setAlertOpen: (alertStatus) => set({ alertOpen: alertStatus }),

  // global state data for rankingdb
  rankingData: [],
  setRankingData: (data) => set({ rankingData: data }),

  compareRankingData: [],
  setCompareRankingData: (data) => set({ compareRankingData: data }),

  selectedLocation: [],
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  offset: 0,
  setOffset: (data) => set({ offset: data }),

  clicked: false,
  setIsClicked: (data) => set({ clicked: data }),

  // previousYearDates:{
  //   oldStartDate:oldStartDate,
  //   oldEndDate:oldEndDate
  // },
  // SetPreviousYearDates: (param) =>
  //   set((state) => ({ previousYearDates: { ...state.previousYearDates, ...param } })),

  isDropdown: false,
  setIsDropdown: (value) => set({ isDropdown: value }),

  selectedLocation: "Karnataka",
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  analyticsLocationDataStore: ["Kolkata"],
  setAnalyticsLocationDataStore: (data) =>
    set((state) => ({
      analyticsLocationDataStore: [
        ...state.analyticsLocationDataStore,
        ...data,
      ],
    })),

  selectedLocationProperties: {},
  setSelectedLocationProperties: (properties) =>
    set({ selectedLocationProperties: properties }),

  currentLevel: "state",
  setcurrentLevel: (level) => set({ currentLevel: level }),

  // pollutant UI design global state
  severityBarColor: { backgroundColor: "#efefef" },
  setSeverityBarColor: (color) => set({ severityBarColor: color }),

  severityBarHeight: { height: "50%" },
  setSeverityBarHeight: (color) => set({ severityBarHeight: color }),

  searchedCity: "Delhi",
  setSearchedCity: (city) => set({ searchedCity: city }),

  selectedLocationData: [], // in map-details set this data separately for the selected location
  setSelectedLocationData: (value) => set({ selectedLocationData: value }),

  selectedLocationChartData: [], // in map-details set this data separately for the selected location
  setSelectedLocationChartData: (value) =>
    set({ selectedLocationChartData: value }),

  selectedCityDailyData: [],
  setSelectedCityDailyData: (data) => set({ selectedCityDailyData: data }),

  selectedCitySeverityText: "",
  setSelectedCitySeverityText: (text) =>
    set({ selectedCitySeverityText: text }),

  chartColorStops: [],
  setChartColorStops: (colorStops) => set({ chartColorStops: colorStops }),

  cityPollutionData: {
    selectedDistrictDailyData: [],
    dailyAveragesList: [],
    PM25Chart: [],
    PM10Chart: [],
    NO2Chart: [],
    O3Chart: [],
    COChart: [],
    SO2Chart: [],
    pm25Area: [],
    colorStops: [],
  },
  setCityPollutionData: (pollutionData) =>
    set({ cityPollutionData: pollutionData }),

  mapDetailSubmitClicked: false,
  setMapDetailSubmitClicked: (click) => set({ mapDetailSubmitClicked: click }),

  error: { open: false, message: null },
  setError: (value) => set({ error: value }),

  mapDetailsRankingData: [],
  setMapDetailsRankingData: (data) => set({ mapDetailsRankingData: data }),

  analyticsLocationData: [
    {
      id: 3309,
      name: "Kolkata",
      division_id: null,
      state_id: 1517,
      data_nodes_count: 7,
      admin_level: "districts",
    },
  ],

  setanalyticsLocationData: (data) => set({ analyticsLocationData: data }),

  // pollutant name to be used/selected in the table in /overview
  tablePollutant: "PM2.5",
  setTablePollutant: (value) => set({ tablePollutant: value }),

  todayStartDate: todayStart,
  setTodayStartDate: (dateValue) => set({ todayStartDate: dateValue }),

  todayEndDate: endOfDay,
  setTodayEndDate: (dateValue) => set({ todayEndDate: dateValue }),

  isChanged: false,
  setIsChanged: (click) => set({ isChanged: click }),

  simpleAlertInfo: { open: false, message: null },
  setSimpleAlertInfo: (value) => set({ simpleAlertInfo: value }),

  lastUpdateDate: null,
  setLastUpdateDate: (dateValue) => set({ lastUpdateDate: dateValue }),

  rankingDurationLabel: "Yesterday",
  setRankingDurationLabel: (durationParam) =>
    set({ rankingDurationLabel: durationParam }),

  isMapDatePickerOpen: false,
  setIsMapDatePickerOpen: (click) => set({ isMapDatePickerOpen: click }),
}));

export const AnalyticsStore = create((set) => ({
  analyticsParams: {
    pollutant: "PM2.5",
    // groupby: "Station",
    duration: "Yesterday",
    startDate: todayStart.format("YYYY-MM-DD HH:mm:ss"),
    endDate: endOfDay.format("YYYY-MM-DD HH:mm:ss"),
    // oldStartDate: newPrevYearStartDate,
    Uptime: 0,
    // oldEndDate: newPrevYearPrevEndDate,
    locations: ["Kolkata"],
    graph: "Line Graph",
  },
  setAnalyticsParams: (param) =>
    set((state) => ({
      analyticsParams: { ...state.analyticsParams, ...param },
    })),
}));

export const useMapDetailsStore = create((set) => ({
  mapDetailsParams: {
    pollutant: "PM2.5",
    duration: "Yesterday",
    compare: "None",
    startDate: todayStart.format("YYYY-MM-DD HH:mm:ss"),
    endDate: endOfDay.format("YYYY-MM-DD HH:mm:ss"),
    // oldStartDate: newPrevYearStartDate,
    Uptime: 0,
    // oldEndDate: newPrevYearPrevEndDate,
    location: "",
  },
  setMapDetailsParams: (param) =>
    set((state) => ({
      mapDetailsParams: { ...state.mapDetailsParams, ...param },
    })),
}));
