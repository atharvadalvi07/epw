import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const CloudFloodPlot = ({ epw }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!epw) return;
    epwCloudFloodPlot(epw, svgRef.current, tooltipRef.current);

    const handleResize = () => {
      d3.select(svgRef.current).select("svg").remove();
      epwCloudFloodPlot(epw, svgRef.current, tooltipRef.current);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [epw]);

  return (
    <Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
      <div className="relative w-full">
        <h4 className="text-black text-2xl font-sans font-semibold mb-4">
          Cloud Flood Plot
        </h4>
        <div id="epwCloudFloodPlot" ref={svgRef} className="relative">
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
      </div>
    </Card>
  );
};

function epwCloudFloodPlot(epw, svgContainer, tooltipContainer) {
  const value = epw.totalSkyCover();
  const data = epwData(epw, value);

  const params = {
    id: svgContainer,
    min_value: 0,
    max_value: 10,
    unit: "",
    steps: 10,
    step_colors: ['#6fdcfb', '#6bcde9', '#68bfd8', '#65b1c7', '#62a3b6', '#5f95a5', '#5b8793', '#587982', '#556b71', '#525d60', '#4f4f4f']
  };

  epwFloodPlot(data, params, tooltipContainer);
}

function epwData(epw, value) {
  const month = epw.month();
  const day = epw.day();
  const hour = epw.hour();
  const dayOfYear = [];
  const data = [];

  for (let i = 0; i < value.length; i++) {
    dayOfYear[i] = Math.floor(i / 24) + 1;
    const datum = { "index": i, "month": month[i], "day": day[i], "hour": hour[i], "dayOfYear": dayOfYear[i], "value": value[i] };
    data.push(datum);
  }

  return data;
}

function epwFloodPlot(data, params, tooltipContainer) {
  d3.select(params.id).select("svg").remove();

  const containerWidth = params.id.clientWidth - 200;
  const containerHeight = containerWidth / 2;

  const color = d3.scaleQuantize()
    .domain([params.min_value, params.max_value])
    .range(params.step_colors);

  const width = containerWidth,
    height = containerHeight-10,
    cellSize = width / 50,
    padding = 40;

  const svg = d3.select(params.id).append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  const x = d3.scaleLinear()
    .domain([1, 365])
    .range([0, width - padding]);

  const y = d3.scaleTime()
    .domain([new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23, 0)])
    .range([0, height - padding]);

  const xAxis = d3.axisTop()
    .scale(x)
    .ticks(12)
    .tickFormat(d => {
      return new Date(2000, d / 30, 1).toLocaleDateString('en-us', { month: 'short' });
    });

  const yAxis = d3.axisLeft()
    .scale(y)
    .ticks(24)
    .tickFormat(d3.timeFormat('%H'));

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,0)")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  svg.selectAll(".hour")
    .data(data)
    .enter().append("rect")
    .attr("x", d => x(d.dayOfYear))
    .attr("y", d => y(new Date(2000, 0, 1, d.hour, 0)))
    .attr("class", "hour")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .style("fill", d => color(d.value))
    .on("mouseover", (event, d) => {
      d3.select(tooltipContainer)
        .style("visibility", "visible")
        .text(`Day: ${d.dayOfYear}, Hour: ${d.hour}, Cloud Cover: ${d.value.toFixed(2)}`);
    })
    .on("mousemove", event => {
      d3.select(tooltipContainer)
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", () => {
      d3.select(tooltipContainer).style("visibility", "hidden");
    });

  const legend = svg.selectAll(".legend")
    .data(color.range().map(d => {
      const [min, max] = color.invertExtent(d);
      return { color: d, min, max };
    }))
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => "translate(" + i * 31 + "," + (height - padding / 2) + ")");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 30)
    .attr("height", 10)
    .style("fill", d => d.color);

  legend.append("text")
    .attr("x", 0)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(d => d3.format('.0f')(d.min) + params.unit);
}

export { CloudFloodPlot };

/*
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const CloudFloodPlot = ({ epw }) => {
const svgRef = useRef();

useEffect(() => {
if (!epw) return;

epwCloudFloodPlot(epw, svgRef.current);

}, [epw]);

return (
<Card className="rounded-xl bg-white sm:m-10 shadow-medium px-6 pt-10 pb-6 xs:mb-4">
  <div className="w-3/4">
    <h4 className="text-black text-2xl font-sans font-semibold">
      Cloud Flood Plot
    </h4>
    <div id="epwCloudFloodPlot" ref={svgRef}></div>
  </div>
</Card>
);
};

function epwCloudFloodPlot(epw, svgContainer) {
const value = epw.totalSkyCover();
const data = epwData(epw, value);

const params = {
id: svgContainer,
min_value: 0,
max_value: 10,
unit: "",
steps: 10,
step_colors: ['#6fdcfb', '#6bcde9', '#68bfd8', '#65b1c7', '#62a3b6', '#5f95a5', '#5b8793', '#587982', '#556b71',
'#525d60', '#4f4f4f']
};

epwFloodPlot(data, params);
}

function epwData(epw, value) {
const month = epw.month();
const day = epw.day();
const hour = epw.hour();
const dayOfYear = [];
const data = [];

for (let i = 0; i < value.length; i++) { dayOfYear[i]=Math.floor(i / 24) + 1; const datum={ "index" : i, "month" :
  month[i], "day" : day[i], "hour" : hour[i], "dayOfYear" : dayOfYear[i], "value" : value[i] }; data.push(datum); }
  return data; } function epwFloodPlot(data, params) { const color=d3.scaleQuantize() .domain([params.min_value,
  params.max_value]) .range(params.step_colors); const width=700, height=300, cellSize=17, padding=30; const
  svg=d3.select(params.id).append("svg") .attr("width", width) .attr("height", height) .append("g")
  .attr("transform", "translate(" + padding + "," + padding / 2 + ")" ); const x=d3.scaleLinear() .domain([1, 365])
  .range([0, width - padding]); const y=d3.scaleTime() .domain([new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23,
  0)]) .range([0, height - padding]); const xAxis=d3.axisTop() .scale(x) .ticks(12) .tickFormat(d=> {
  return new Date(2000, d / 30, 1).toLocaleDateString('en-us', { month: 'short' });
  });

  const yAxis = d3.axisLeft()
  .scale(y)
  .ticks(24)
  .tickFormat(d3.timeFormat('%H'));

  svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0,0)")
  .call(xAxis);

  svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

  svg.selectAll(".hour")
  .data(data)
  .enter().append("rect")
  .attr("x", d => x(d.dayOfYear))
  .attr("y", d => y(new Date(2000, 0, 1, d.hour, 0)))
  .attr("class", "hour")
  .attr("width", cellSize)
  .attr("height", cellSize)
  .style("fill", d => color(d.value));

  const legend = svg.selectAll(".legend")
  .data(color.range().map(d => {
  const [min, max] = color.invertExtent(d);
  return { color: d, min, max };
  }))
  .enter().append("g")
  .attr("class", "legend")
  .attr("transform", (d, i) => "translate(" + i * 31 + "," + (height - padding / 2) + ")");

  legend.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 30)
  .attr("height", 10)
  .style("fill", d => d.color);

  legend.append("text")
  .attr("x", 0)
  .attr("y", 10)
  .attr("dy", ".35em")
  .text(d => d3.format('.0f')(d.min) + params.unit);
  }

  export { CloudFloodPlot };
  */