import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const TempFloodPlot = ({ epw, unitSystem }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    if (!epw) return;

    epwTempFloodPlot(epw, svgRef.current, unitSystem, tooltipRef.current);

  }, [epw, unitSystem]);

  return (
    <div className="sm:m-10">
      <Card className="p-6 shadow-none rounded-lg md:flex gap-6">
        <Card className="w-full h-auto rounded-lg shadow-none bg-[#FEAD7E4D]">
          <div className="md:flex justify-between gap-6">
            <div className="md:w-3/5 ml-6">
              <p className="mt-[18px] text-2xl font-bold">
                Temperature Flood Plot
              </p>
              <div className="pt-3" id="epwTempFloodPlot" ref={svgRef}>
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
          </div>
        </Card>
      </Card>
    </div>
  );
};

function epwTempFloodPlot(epw, svgContainer, unitSystem, tooltipContainer) {
  const value = unitSystem === "IP" ? epw.dryBulbTemperature() : epw.dryBulbTemperature();
  const data = epwData(epw, value);

  const params = {
    id: svgContainer,
    min_value: Math.min(...value),
    max_value: Math.max(...value),
    unit: unitSystem === "IP" ? "\xB0F" : "\xB0C",
    steps: 7,
    step_colors: ['darkblue', 'blue', 'cyan', 'greenyellow', 'yellow', 'orange', 'red', 'darkred']
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

  const color = d3.scaleQuantize()
    .domain([params.min_value, params.max_value])
    .range(params.step_colors);

  const width = 1400,
    height = 500,
    cellSize = 25,
    padding = 100;

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

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", ((width - padding) / 2))
    .attr("y", -20)
    .text("Month");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("y", -35)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2) + (padding / 2))
    .text("Hour");

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
        .text(`Day: ${d.dayOfYear}, Hour: ${d.hour}, Temp: ${d.value.toFixed(1)} °C`);
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

function convertCtoF(celsiusValues) {
  return celsiusValues.map(c => (c * 9 / 5) + 32);
}

export { TempFloodPlot };

/*
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Card from "@mui/material/Card";

const TempFloodPlot = ({ epw, unitSystem }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!epw) return;

    epwTempFloodPlot(epw, svgRef.current, unitSystem);

  }, [epw, unitSystem]);

  return (
    <div className="sm:m-10">
      <Card className="p-6 shadow-none rounded-lg md:flex gap-6">
        <Card className="w-full h-auto rounded-lg shadow-none bg-[#FEAD7E4D]">
          <div className="md:flex justify-between gap-6">
            { Content }
            <div className="md:w-3/5 ml-6">
              <p className="mt-[18px] text-2xl font-bold">
                Temperature Flood Plot
              </p>
              <div className="pt-3" id="epwTempFloodPlot" ref={svgRef}> 
              </div>
            </div>
        </div>
        </Card>
        </Card>
    </div>
    
  );
};

function epwTempFloodPlot(epw, svgContainer, unitSystem) {
  const value = unitSystem === "IP" ? convertCtoF(epw.dryBulbTemperature()) : epw.dryBulbTemperature();
  const data = epwData(epw, value);

  const params = {
    id: svgContainer,
    min_value: Math.min.apply(Math, value),
    max_value: Math.max.apply(Math, value),
    unit: unitSystem === "IP" ? "\xB0F" : "\xB0C",
    steps: 7,
    step_colors: ['darkblue', 'blue', 'cyan', 'greenyellow', 'yellow', 'orange', 'red', 'darkred']
  };

  epwFloodPlot(data, params);
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

function epwFloodPlot(data, params) {
    d3.select(params.id).select("svg").remove();

  const color = d3.scaleQuantize()
    .domain([params.min_value, params.max_value])
    .range(params.step_colors);

  const width = 900,
    height = 500,
    cellSize = 25,
    padding = 100;

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

    svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "middle")
  .attr("x", ((width - padding) / 2))
  .attr("y", 0-20)
  .text("Month");

  svg.append("text")
  .attr("class", "y label")
  .attr("text-anchor", "middle")
  .attr("y", -35)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .attr("x", -(height / 2) + (padding / 2))
  .text("Hour");


  svg.selectAll(".hour")
    .data(data)
    .enter().append("rect")
    .attr("x", d => x(d.dayOfYear))
    .attr("y", d => y(new Date(2000, 0, 1, d.hour, 0)))
    .attr("class", "hour")
    .attr("width", cellSize )
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

function convertCtoF(celsiusValues) {
  return celsiusValues.map(c => (c * 9/5) + 32);
}

export { TempFloodPlot };
*/
