import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const Visualization = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!data) return;

    const temperatures = data.dryBulbTemperature();
    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    const margin = { top: 40, right: 30, bottom: 50, left: -300 };
    const width = 1125; 
    const height = 400; 

    svg.attr("viewBox", `0 0 800 400`);

    svg.selectAll('*').remove();

    const x = d3.scaleLinear()
      .domain([0, temperatures.length - 1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([d3.min(temperatures), d3.max(temperatures)])
      .range([height - margin.bottom, margin.top]);

    const xAxis = g => g
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0));

    const yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(height / 40))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start"));

    const area = d3.area()
      .curve(d3.curveMonotoneX)
      .x((d, i) => x(i))
      .y0(y(0))
      .y1(d => y(d));

    const line = d3.line()
      .curve(d3.curveMonotoneX)
      .x((d, i) => x(i))
      .y(d => y(d));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    svg.append("path")
      .datum(temperatures)
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.1)
      .attr("d", area);

    svg.append("path")
      .datum(temperatures)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", 350) 
      .attr("y", 380) 
      .style("text-anchor", "middle")
      .text("Day");

    svg.append("text")
      .attr("class", "y-axis-label")
      .attr("transform", "rotate(-90)") 
      .attr("x", 0 - (height / 2))
      .attr("y", -350)
      .attr("dy", "0.75em")
      .style("text-anchor", "middle")
      .text("Dry bulb temperature (°C)");
  /*  
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
      */
    
    svg.selectAll("circle")
      .data(temperatures)
      .enter()
      .append("circle")
      .attr("cx", (d, i) => x(i))
      .attr("cy", d => y(d))
      .attr("r", 2)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip.style("visibility", "visible")
          .text(`Temperature: ${d.toFixed(2)} °C`);
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
          Temperature vs Time
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

export { Visualization };
