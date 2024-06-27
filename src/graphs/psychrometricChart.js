import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const PsychrometricChart = () => {
    const [processedData, setProcessedData] = useState([]);

    useEffect(() => {
        d3.csv('/hourly.csv', d3.autoType).then((data) => {
            console.log("Raw CSV data:", data); 
            const processed = data.map(d => ({
                dryBulbTemp: convertFtoC(d['Dry Bulb Temp']),
                relativeHumidity: d['Rel Humidity']
            }));
            console.log("Processed data:", processed); 
            setProcessedData(processed);
        }).catch(error => {
            console.error("Error loading CSV data:", error);
        });
    }, []);

    if (processedData.length === 0) {
        return <div>Loading data...</div>; 
    }

    const trace = {
        x: processedData.map(d => d.dryBulbTemp),
        y: processedData.map(d => calculateHumidityRatio(d.dryBulbTemp, d.relativeHumidity)),
        type: 'histogram2d',
        colorscale:''
    };

    console.log("Trace data:", trace); 

    return (
      <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
        <Plot
            data={[trace]}
            layout={{
                title: 'Psychrometric Chart',
                xaxis: { title: 'Temperature (°C)' },
                yaxis: { title: 'Humidity Ratio (g water/kg dry air)' },
                colorscale:'Blues_r'
            }}
        />
      </Card>
    );
};


const convertFtoC = (fahrenheit) => (fahrenheit - 32) * 5 / 9;

const calculateHumidityRatio = (temperature, relativeHumidity) => {
    const saturationPressure = 6.112 * Math.exp((17.67 * temperature) / (temperature + 243.5));
    const actualVaporPressure = relativeHumidity / 100 * saturationPressure;
    const humidityRatio = 0.62198 * (actualVaporPressure / (1013.25 - actualVaporPressure));
    return humidityRatio * 1000; 
};

export default PsychrometricChart;

/*
const PsychrometricChart = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

    const [data, setData] = useState([]);

    useEffect(() => {
        // Load the data from the JSON file
        d3.json('/epw_filtered_data.json').then((data) => {
            const processedData = data.map(d => ({
                dryBulbTemp: +d.DryBulbTemp,
                dewPointTemp: +d.DewPointTemp,
                relativeHumidity: +d.RelativeHumidity
            }));
            setData(processedData);
        });
    }, []);

    const trace = {
        x: data.map(d => d.dryBulbTemp),
        y: data.map(d => calculateHumidityRatio(d.dryBulbTemp, d.relativeHumidity)),
        type: 'histogram2d',
        colorscale: 'Blues'
    };

    return (
        <Plot
            data={[trace]}
            layout={{
                title: 'Psychrometric Chart',
                xaxis: { title: 'Temperature (°C)' },
                yaxis: { title: 'Humidity Ratio (g water/kg dry air)' }
            }}
        />
    );
};

// Function to calculate the humidity ratio
const calculateHumidityRatio = (temperature, relativeHumidity) => {
    const saturationPressure = 6.112 * Math.exp((17.67 * temperature) / (temperature + 243.5));
    const actualVaporPressure = relativeHumidity / 100 * saturationPressure;
    const humidityRatio = 0.62198 * (actualVaporPressure / (1013.25 - actualVaporPressure));
    return humidityRatio * 1000; // Convert to g water/kg dry air
};

export default PsychrometricChart;

/*

  useEffect(() => {
    if (!data ) {
      console.log("No data available");
      return;
    }

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    svg.selectAll('*').remove();

    const temperatures = data.map(d => d.DryBulbTemperature);
    console.log("temp", temperatures)
    const humidityRatios = data.hourly.map(d => d.HumidityRatio * 1000);
    console.log("humid", temperatures)

    const x = d3.scaleLinear()
      .domain(d3.extent(temperatures))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(d3.extent(humidityRatios))
      .range([height, 0]);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(humidityRatios)]);

    svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(y).ticks(10));

    svg.append("g")
      .attr("transform", `translate(${margin.left},${height + margin.top})`)
      .call(d3.axisBottom(x).ticks(10));

    const svgChart = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const heatmapData = temperatures.map((temp, i) => ({ temp, hr: humidityRatios[i] }));

    const bins = d3.histogram()
      .value(d => d.temp)
      .domain(x.domain())
      .thresholds(x.ticks(40))
      (heatmapData);

    const binData = bins.map(bin => ({
      x0: bin.x0,
      x1: bin.x1,
      y0: d3.min(bin, d => d.hr),
      y1: d3.max(bin, d => d.hr),
      count: bin.length
    }));

    const binWidth = x(bins[0].x1) - x(bins[0].x0);

    svgChart.selectAll('rect')
      .data(binData)
      .enter().append('rect')
      .attr('x', d => x(d.x0))
      .attr('y', d => y(d.y1))
      .attr('width', binWidth)
      .attr('height', d => y(d.y0) - y(d.y1))
      .attr('fill', d => colorScale(d.count))
      .attr('stroke', 'none')
      .attr('opacity', 0.6);

    const contour = d3.contourDensity()
      .x(d => x(d.temp))
      .y(d => y(d.hr))
      .size([width, height])
      .bandwidth(20)
      .thresholds(10);

    svgChart.append("g")
      .selectAll("path")
      .data(contour(heatmapData))
      .enter().append("path")
      .attr("d", d3.geoPath())
      .style("fill", "none")
      .style("stroke", "#000")
      .style("stroke-width", 1);

    svg.append("text")
      .attr("x", (width / 2) + margin.left)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Psychrometric Chart");

    svg.append("text")
      .attr("x", (width / 2) + margin.left)
      .attr("y", height + margin.top + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Dry Bulb Temperature (°C)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 40)
      .attr("x", 0 - (height / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Humidity Ratio (g/kg)");

    // Tooltip
    svgChart.selectAll("circle")
      .data(heatmapData)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.temp))
      .attr("cy", d => y(d.hr))
      .attr("r", 2)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`Temp: ${d.temp.toFixed(2)} °C, HR: ${d.hr.toFixed(2)} g/kg`);
      })
      .on("mousemove", event => {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

  }, [data]);

  return (
    <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
      <div className="w-full h-full">
        <h4 className="text-black text-2xl font-sans font-semibold">
          Psychrometric Chart
        </h4>
        <svg ref={svgRef} width="100%" height="400px"></svg>
        <div ref={tooltipRef} style={{
          position: 'absolute',
          backgroundColor: 'white',
          padding: '4px 8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          pointerEvents: 'none',
          visibility: 'hidden'
        }}></div>
      </div>
    </Card>
  );
};

export default PsychrometricChart;
*/
