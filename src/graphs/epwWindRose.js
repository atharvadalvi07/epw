import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const WindRoseChart = ({ epw, unitSystem }) => {
  const svgRef = useRef();

  const convertKnots = (windSpeeds) => windSpeeds.map(speed => speed * 0.514444);

  const epwData = (epw, value) => {
    const month = epw.month();
    const day = epw.day();
    const hour = epw.hour();
    const data = [];

    for (let i = 0; i < value.length; i++) {
      const dayOfYear = Math.floor(i / 24) + 1;
      data.push({ index: i, month: month[i], day: day[i], hour: hour[i], dayOfYear, value: value[i] });
    }

    return data;
  };

  const epwRadialChart = (data, params) => {
    const steps = params.steps;
    const scale_steps = params.scale_steps;

    const colorScale = d3.scaleOrdinal()
      .domain(scale_steps)
      .range(params.step_colors);

    data.forEach(d => {
      for (let j = 0; j < steps; j++) {
        d.scaleStep = j;
        if (d.value < scale_steps[j]) break;
      }
    });

    const mapped_data = d3.group(data, d => d.directionGroup, d => d.scaleStep);

    const zero_num = mapped_data.get(0)?.get(0)?.length ?? 0;
    const zero_frac = zero_num / params.length;

    const arc_data = [];
    let max_radius = 0;

    for (let i = 1; i <= params.directions; i++) {
      const c = mapped_data.get(i) ?? new Map();
      let prior_radius = 0;
      for (let j = 0; j < steps; j++) {
        const count = c.get(j)?.length ?? 0;
        if (count === 0) continue;
        const arc = {
          directionGroup: i,
          scaleStep: j,
          innerRadius: prior_radius,
          outerRadius: prior_radius + count
        };
        if (arc.outerRadius > max_radius) max_radius = arc.outerRadius;
        arc_data.push(arc);
        prior_radius = arc.outerRadius;
      }
    }

    const margin = { top: 20, right: 220, bottom: 20, left: 20 };
    const width = 700 - margin.left - margin.right;
    const height = 540 - margin.top - margin.bottom;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(cx, cy);

    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.selectAll('*').remove(); // Clear previous content

    const g = svg.append("g")
      .attr("transform", `translate(${cx + margin.left},${cy + margin.top})`);

    const lines = g.append("g").selectAll("line")
      .data(params.labels)
      .enter().append("line")
      .attr("class", "label-line")
      .attr("y2", -0.85 * radius)
      .style("stroke", "black")
      .style("stroke-width", ".5px")
      .attr("transform", (d, i) => `rotate(${i * 360 / params.directions})`);

    const labels = g.append("g").selectAll("text")
      .data(params.labels)
      .enter().append("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .attr("x", (d, i) => 0.9 * radius * Math.sin((i + 1) * 2 * Math.PI / params.directions))
      .attr("y", (d, i) => 0.9 * radius * -Math.cos((i + 1) * 2 * Math.PI / params.directions))
      .text(d => d);

    const scaling_factor = (0.8 * radius) / max_radius;
    const arc = d3.arc()
      .outerRadius(d => d.outerRadius * scaling_factor)
      .innerRadius(d => d.innerRadius * scaling_factor)
      .startAngle(d => (d.directionGroup * (2 * Math.PI / params.directions)) - (Math.PI / params.directions))
      .endAngle(d => (d.directionGroup * (2 * Math.PI / params.directions)) + (Math.PI / params.directions));

    g.selectAll('path')
      .data(arc_data)
      .enter().append("path")
      .attr("d", arc)
      .style("fill", d => colorScale(d.scaleStep))
      .style("stroke", "black")
      .style("stroke-width", "0.5px");

    g.append("text")
      .attr("class", "calm-label")
      .attr("text-anchor", "middle")
      .attr("x", 0)
      .attr("y", 0)
      .text(d3.format(".1%")(zero_frac) + " calm");

    const legend = g.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${radius + 55},${-radius + 30})`)
      .selectAll("g")
      .data(params.legend_text)
      .enter().append("g");

    legend.append("rect")
      .attr("y", (d, i) => i * 25)
      .attr("width", 40)
      .attr("height", 15)
      .style("fill", (d, i) => colorScale(i));

    legend.append("text")
      .attr("x", 45)
      .attr("y", (d, i) => (i * 25) + 8)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text(d => d);
  };

  useEffect(() => {
    if (!epw) {
      console.warn('No EPW data provided');
      return;
    }

    let params = {};
    let value = [];

    if (unitSystem === "IP") {
      value = convertKnots(epw.windSpeed());
      params.unit = "knots";
      params.scale_steps = [3.5, 6.5, 10.5, 16.5, 21.5, 27];
      params.steps = 6;
    } else {
      value = epw.windSpeed();
      params.unit = "m/s";
      params.scale_steps = [1.8, 3.3, 5.4, 8.5, 11.1, 13.9];
      params.steps = 6;
    }

    const data = epwData(epw, value);
    const direction = epw.windDirection();

    for (let i = 0; i < value.length; i++) {
      data[i].direction = direction[i];
      data[i].directionGroup = Math.round(direction[i] / 22.5);
      if (data[i].directionGroup === 0) data[i].directionGroup = 16;
      if (data[i].value === 0) data[i].directionGroup = 0;
    }

    params.id = "#epwWindRose";
    params.min_value = 0;
    params.max_value = Math.max(...value);
    params.length = value.length;
    params.directions = 16;
    params.labels = ['NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
    params.step_colors = ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'];
    params.legend_text = ['Light Air', 'Light Breeze', 'Gentle Breeze', 'Moderate Breeze', 'Fresh Breeze', 'Strong Breeze'];

    epwRadialChart(data, params);

  }, [epw, unitSystem]);

  return (
    <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
      <div className="w-full">
        <h4 className="text-black text-2xl font-sans font-semibold">
          Wind Rose Chart
        </h4>
        <svg ref={svgRef}></svg>
      </div>
    </Card>
  );
};

export { WindRoseChart };
