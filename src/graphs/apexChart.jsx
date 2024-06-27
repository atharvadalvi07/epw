"use client";
import { lineChartData } from "@/data/overviewChartData";
import { useZustandStore } from "@/store/zustandStore";
import moment from "moment";
import React from "react";
import Chart from "react-apexcharts";

const ApexChart = ({
  pollutantName,
  noDataText,
  seriesData,
  colorStops,
  colorStops2,
  colorStops3,
}) => {
  const options = {
    chart: { height: 350, type: "area" },
    fill: {
      colors: ["#B8FFC780"],
      type: "gradient", // Use gradient fill
      gradient: {
        shade: "dark",
        shadeIntensity: 1,
        // inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        // stops: [0, 30, 60, 90, 100],
        type: "vertical",
        colorStops: [
          colorStops,
          // this second array of color stops is for the area chart
          colorStops2,
          colorStops3 && colorStops3,
        ],
      },
    },
    // fill: {
    //   colors: ["#cdffcd", "#FFFF00"],
    //   type: ["gradient", "linear"],
    //   gradient: {
    //     shadeIntensity: 1,
    //     inverseColors: false,
    //     opacityFrom: 0.5,
    //     opacityTo: 0,
    //     stops: [0, 100],
    //     colorStops: [
    //       {
    //         offset: 0,
    //         color: "#cdffcd", // Green color at the top
    //         opacity: 1,
    //       },
    //       {
    //         offset: 50,
    //         color: "#cdffcd", // Red color at the bottom
    //         opacity: 0.5,
    //       },
    //       {
    //         offset: 100,
    //         color: "#cdffcd", // Red color at the bottom
    //         opacity: 0,
    //       },
    //     ],
    //   },
    // },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      colors: ["#00FF00", "#00D22D"], // Yellow color for the line plot
      width: [1.5, 1], // Adjust the line width as needed
    },
    xaxis: {
      type: "datetime",
      tickAmount: 7,
      title: {
        text: "Time",
        style: {
          color: "#6F767E",
          fontSize: "15px",
          // fontFamily: "Inter, Arial, sans-serif",
          fontWeight: 300,
          // letterSpacing: "3px",
        },
      },
      tooltip: {
        enabled: false,
        formatter: function (val, opts) {
          // console.log("val");
          // console.log(moment(val).format("DD-MMM-YYYY hA:m"));
          return moment(val).format("DD-MMM-YYYY h:mmA");
        },
      },
      labels: {
        formatter: function (value) {
          return moment(value).format("DD-MMM-YYYY h:mmA");
        },
      },
    },
    yaxis: {
      title: {
        text:
          pollutantName !== "CO"
            ? `${pollutantName} (μg/m³)`
            : `${pollutantName} (mg/m³)`,
        style: {
          color: "#6F767E",
          fontSize: "15px",
          // fontFamily: "Inter, Arial, sans-serif",
          fontWeight: 300,
          // letterSpacing: "3px",
        },
      },
    },

    legend: {
      show: false,
    },
    tooltip: {
      theme: "dark",
      style: {
        // backgroundColor: "#000",
        fontSize: "12px",
      },
      enabledOnSeries: [0],
      // x: {
      //   show: false,
      //   format: "dd/MM/yy HH:mm",
      // },
      marker: {
        show: false,
      },
    },
    markers: {
      colors: ["#6F767E", "#00000000"],
      strokeColors: ["#33383F", "#00000000"],
      hover: {
        size: 4,
        // sizeOffset: 3
      },
    },
    noData: {
      text: noDataText,
      align: "center",
      verticalAlign: "middle",
      offsetX: 0,
      offsetY: 0,
      style: {
        color: "#000000",
        fontSize: "18px",
        fontFamily: "Open Sans",
      },
    },
    series: seriesData,
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-screen-xl text-black">
        {typeof window !== "undefined" && (
          <Chart
            type="area"
            options={options}
            series={options.series}
            height={366}
            // width={1200}
          />
        )}
      </div>
    </div>
  );
};

export default ApexChart;
