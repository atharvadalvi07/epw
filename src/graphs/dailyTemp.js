/*
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from '@mui/material';
import './VisualizationDaily.css'; 

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toCelsius = (fahrenheit) => (fahrenheit - 32) * 5 / 9;

export const VisualizationDaily = ({ data }) => {
  const svgRefs = useRef([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    svgRefs.current.forEach(svg => {
      d3.select(svg).selectAll("*").remove();
    });

    const margin = { top: 10, right: 5, bottom: 30, left: 25 }; 
    const width = 80; 
    const height = 90; 


    const dataByMonth = Array.from({ length: 12 }, () => []);

    data.forEach(d => {
      const convertedData = {
        ...d,
        low: toCelsius(d.low),
        high: toCelsius(d.high),
        avg: toCelsius(d.avg)
      };
      dataByMonth[convertedData.month - 1].push(convertedData);
    });


    const globalMinY = d3.min(dataByMonth.flat(), d => d.low);
    const globalMaxY = d3.max(dataByMonth.flat(), d => d.high);

    const y = d3.scaleLinear()
      .domain([globalMinY, globalMaxY])
      .range([height, 0]);

    const yAxis = d3.axisLeft(y).ticks(5);

    dataByMonth.forEach((monthData, index) => {
      if (monthData.length === 0) return;

      const firstDay = new Date(2022, index, 1);
      const lastDay = new Date(2022, index + 1, 0);
      const x = d3.scaleTime()
        .domain([firstDay, lastDay])
        .range([0, width]);

      const xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat("%d"));

      const svg = d3.select(svgRefs.current[index])
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


      svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .call(g => g.selectAll("text").attr("font-size", "10px"))
        .call(g => g.selectAll("line").attr("stroke", "#e0e0e0").attr("stroke-width", 0.5));

      const line = d3.line()
        .x(d => x(new Date(2022, d.month - 1, d.day)))
        .y(d => y(d.avg));

      svg.append("path")
        .datum(monthData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("d", line);

        
      svg.selectAll(".dot-high")
        .data(monthData)
        .enter().append("circle")
        .attr("class", "dot-high")
        .attr("cx", d => x(new Date(2022, d.month - 1, d.day)))
        .attr("cy", d => y(d.high))
        .attr("r", 2)
        .attr("fill", "red");

      svg.selectAll(".dot-low")
        .data(monthData)
        .enter().append("circle")
        .attr("class", "dot-low")
        .attr("cx", d => x(new Date(2022, d.month - 1, d.day)))
        .attr("cy", d => y(d.low))
        .attr("r", 2)
        .attr("fill", "lightblue");


      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("color", "#000")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.1)");

      svg.selectAll(".hover-area")
        .data(monthData)
        .enter()
        .append("rect")
        .attr("class", "hover-area")
        .attr("x", d => x(new Date(2022, d.month - 1, d.day)) - 2)
        .attr("y", 0)
        .attr("width", 4)
        .attr("height", height)
        .attr("fill", "transparent")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .text(`Date: ${d.month}/${d.day}, Avg Temp: ${d.avg.toFixed(1)}°C, High Temp: ${d.high.toFixed(1)}°C, Low Temp: ${d.low.toFixed(1)}°C`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", `${event.pageY + 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    });

  }, [data]);

  return (
    <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
      <div className='w-full' style={{ textAlign: 'left' }}>
        <p style={{ fontWeight: 'bold', fontSize: '20px' }}>Daily Temperature</p>
      </div>
      
      <div className="chart-container w-full">
        {months.map((month, index) => (
          <div key={month} className="chart">
            <svg ref={el => svgRefs.current[index] = el}></svg>
            <h3 className="chart-title" style={{ marginTop: '5px', textAlign: 'center' }}>{month}</h3>
          </div>
        ))}
      </div>
    </Card>
  );
};
*/

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from '@mui/material';
import './VisualizationDaily.css'; 

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const toCelsius = (fahrenheit) => (fahrenheit - 32) * 5 / 9;

export const VisualizationDaily = ({ data }) => {
  const svgRefs = useRef([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    
    svgRefs.current.forEach(svg => {
      d3.select(svg).selectAll("*").remove();
    });

    const margin = { top: 10, right: 5, bottom: 30, left: 25 }; 
    const width = 80; 
    const height = 90; 

    
    const dataByMonth = Array.from({ length: 12 }, () => []);

    data.forEach(d => {
      const convertedData = {
        ...d,
        low: toCelsius(d.low),
        high: toCelsius(d.high),
        avg: toCelsius(d.avg)
      };
      dataByMonth[convertedData.month - 1].push(convertedData);
    });

    
    const globalMinY = d3.min(dataByMonth.flat(), d => d.low);
    const globalMaxY = d3.max(dataByMonth.flat(), d => d.high);

    const y = d3.scaleLinear()
      .domain([globalMinY, globalMaxY])
      .range([height, 0]);

    const yAxis = d3.axisLeft(y).ticks(5);

    dataByMonth.forEach((monthData, index) => {
      if (monthData.length === 0) return;

      const firstDay = new Date(2022, index, 1);
      const lastDay = new Date(2022, index + 1, 0);
      const x = d3.scaleTime()
        .domain([firstDay, lastDay])
        .range([0, width]);

      const xAxis = d3.axisBottom(x).ticks(3).tickFormat(d3.timeFormat("%d"));

      const svg = d3.select(svgRefs.current[index])
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


      svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

      svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis)
        .call(g => g.selectAll("text").attr("font-size", "10px"))
        .call(g => g.selectAll("line").attr("stroke", "#e0e0e0").attr("stroke-width", 0.5));

      const area = d3.area()
        .x(d => x(new Date(2022, d.month - 1, d.day)))
        .y0(height)
        .y1(d => y(d.avg));

      const line = d3.line()
        .x(d => x(new Date(2022, d.month - 1, d.day)))
        .y(d => y(d.avg));

      svg.append("path")
        .datum(monthData)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("d", line);

      svg.append("path")
        .datum(monthData)
        .attr("fill", "steelblue")
        .attr("opacity", 0.1)
        .attr("d", area);

      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("color", "#000")
        .style("padding", "8px")
        .style("border-radius", "4px")
        .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.1)");

      svg.selectAll(".hover-area")
        .data(monthData)
        .enter()
        .append("rect")
        .attr("class", "hover-area")
        .attr("x", d => x(new Date(2022, d.month - 1, d.day)) - 2)
        .attr("y", 0)
        .attr("width", 4)
        .attr("height", height)
        .attr("fill", "transparent")
        .on("mouseover", (event, d) => {
          tooltip.style("visibility", "visible")
            .text(`Date: ${d.month}/${d.day}, Avg Temp: ${d.avg.toFixed(1)}°C`);
        })
        .on("mousemove", (event) => {
          tooltip.style("top", `${event.pageY + 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
          tooltip.style("visibility", "hidden");
        });
    });

  }, [data]);

  return (
    <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
      <div className='w-full' style={{ textAlign: 'left' }}>
        <p style={{ fontWeight: 'bold', fontSize: '20px' }}>Daily Temperature</p>
      </div>
      
      <div className="chart-container w-full">
        {months.map((month, index) => (
          <div key={month} className="chart">
            <svg ref={el => svgRefs.current[index] = el}></svg>
            <h3 className="chart-title" style={{ marginTop: '5px', textAlign: 'center' }}>{month}</h3>
          </div>
        ))}
      </div>
    </Card>
  );
};


/*
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Card } from '@mui/material';

export const VisualizationDaily = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear the previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 960 - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(2022, d.month - 1, d.day)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.low), d3.max(data, d => d.high)])
      .range([height, 0]);

    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b")).ticks(12);
    const yAxis = d3.axisLeft(y).ticks(10);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .attr("dx", "-2em")
      .attr("dy", ".35em")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "10px");

    // Define the gradient
    svg.append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(d3.min(data, d => d.low)))
      .attr("x2", 0).attr("y2", y(d3.max(data, d => d.high)))
      .selectAll("stop")
      .data([
        { offset: "0%", color: "#ffeda0" },
        { offset: "50%", color: "#feb24c" },
        { offset: "100%", color: "#f03b20" }
      ])
      .enter().append("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color);

    const area = d3.area()
      .x(d => x(new Date(2022, d.month - 1, d.day)))
      .y0(height)
      .y1(d => y(d.avg));

    svg.append("path")
      .datum(data)
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.1)
      .attr("d", area);

    const line = d3.line()
      .x(d => x(new Date(2022, d.month - 1, d.day)))
      .y(d => y(d.avg));

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "blue")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#333")
      .style("color", "#fff")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.1)");

    svg.selectAll(".hover-area")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "hover-area")
      .attr("x", d => x(new Date(2022, d.month - 1, d.day)) - 10)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", height)
      .attr("fill", "transparent")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`Date: ${d.month}/${d.day}, Avg Temp: ${d.avg}°F`);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", `${event.pageY + 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    // Adding X-axis label
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Month");

    // Adding Y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Temperature (°F)");

  }, [data]);

  return (
    <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
      <div>
        <h2>Daily Temperature Chart</h2>
        <svg ref={svgRef}></svg>
      </div>
    </Card>
  );
};
*/