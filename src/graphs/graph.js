import * as d3 from 'd3';
import 'd3';
import { group, rollup } from 'd3';

var params;
var unitSystem;



function clearEPWCharts(epw) {
    d3.selectAll("svg").remove();
};

function epwData(epw, value) {
    var month = epw.month();
    var day = epw.day();
    var hour = epw.hour();
    var dayOfYear = [];
    var data = [];

    for (var i = 0; i < value.length; i++) {
        dayOfYear[i] = Math.floor(i / 24) + 1;
        var datum = { "index": i, "month": month[i], "day": day[i], "hour": hour[i], "dayOfYear": dayOfYear[i], "value": value[i] };
        data.push(datum);
    };

    return data;
};

function valCtoF(value, index, arr) {
    arr[index] = 32 + value * 1.8;
};

function convertCtoF(array) {
    array.forEach(valCtoF);
    return array;
};

function valKnots(value, index, arr) {
    arr[index] = value * 1.94384;
};

function convertKnots(array) {
    array.forEach(valKnots);
    return array;
};

function epwTempFloodPlot(epw) {
    var params = {};
    var value = [];
    if (unitSystem === "IP") {
        value = convertCtoF(epw.dryBulbTemperature());
        params.unit = "\xB0F";
    } else {
        value = epw.dryBulbTemperature();
        params.unit = "\xB0C";
    };
    var data = epwData(epw, value);    
    params.id = "#epwTempFloodPlot";
    params.min_value = Math.min.apply(Math, value);
    params.max_value = Math.max.apply(Math, value);    
    params.steps = 7;
    params.step_colors = ['darkblue', 'blue', 'cyan', 'greenyellow', 'yellow', 'orange', 'red', 'darkred'];
    epwFloodPlot(data, params);
};

function epwCloudFloodPlot(epw) {
    var value = epw.totalSkyCover();
    var data = epwData(epw, value); 
    var params = {};
    params.id = "#epwCloudFloodPlot";
    params.min_value = 0;
    params.max_value = 10;
    params.unit = "";
    params.steps = 10;
    params.step_colors = ['#6fdcfb', '#6bcde9', '#68bfd8', '#65b1c7', '#62a3b6', '#5f95a5', '#5b8793', '#587982', '#556b71', '#525d60', '#4f4f4f'];
    epwFloodPlot(data, params);
};

function epwWindRose(epw) {
    params = {};
    var value = [];
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
    };

    var data = epwData(epw, value); 
    var direction = epw.windDirection();

    for (var i = 0; i < value.length; i++) {
        data[i].direction = direction[i];
        data[i].directionGroup = Math.round(direction[i] / 22.5);
        if (data[i].directionGroup === 0) { 
            data[i].directionGroup = 16;
        };
        if (data[i].value === 0) { 
            data[i].directionGroup = 0;
        };
    };

    params.id = "#epwWindRose";
    params.min_value = 0;
    params.max_value = Math.max.apply(Math, value);
    params.length = value.length;
    params.directions = 16;
    params.labels = ['NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW', 'N'];
    params.step_colors = ['#d73027', '#fc8d59', '#fee090', '#e0f3f8', '#91bfdb', '#4575b4'];
    params.legend_text = ['Light Air', 'Light Breeze', 'Gentle Breeze', 'Moderate Breeze', 'Fresh Breeze', 'Strong Breeze'];

    epwRadialChart(data, params)
};

function epwRadialChart(data, params) {
    var steps = params.steps,
        scale_steps = params.scale_steps;

    var colorScale = d3.scaleOrdinal()
        .domain(scale_steps)
        .range(params.step_colors);

    for (var i = 0; i < params.length; i++) {
        for (var j = 0; j < steps; j++) {
            data[i].scaleStep = j;
            if (data[i].value < scale_steps[j]) { break; }
        };
    };

    var mapped_data = group(data, d => d.directionGroup, d => d.scaleStep);

    var zero_num = 0,
        zero_frac = 0;

    if (zero_num != null) {
        zero_num = mapped_data.get(0)?.get(0)?.length ?? 0;
        zero_frac = zero_num / params.length;
    };

    var arc_data = [],
        max_radius = 0;

    for (let i = 1; i <= params.directions; i++) {
        var c = mapped_data.get(i) ?? new Map();
        var prior_radius = 0;
        for (let j = 0; j < steps; j++) {
            var count = c.get(j)?.length ?? 0;
            if (count === 0) continue;
            var arc = [];
            arc.directionGroup = i;
            arc.scaleStep = j;
            arc.innerRadius = prior_radius;
            arc.outerRadius = prior_radius + count;
            if (arc.outerRadius > max_radius) { max_radius = arc.outerRadius };
            arc_data.push(arc);
            prior_radius = arc.outerRadius;
        }
    }

    var margin = { top: 20, right: 220, bottom: 20, left: 20 },
        width = 700 - margin.left - margin.right,
        height = 540 - margin.top - margin.bottom,
        cx = width / 2,
        cy = height / 2,
        radius = Math.min(cx, cy);

    var svg = d3.select(params.id).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (cx + margin.left) + "," + (cy + margin.top) + ")");

    var lines = svg.append("g").selectAll("line")
        .data(params.labels)
        .enter().append("line")
        .attr("class", "label-line")
        .attr("y2", -0.85 * radius)
        .style("stroke", "black")
        .style("stroke-width", ".5px")
        .attr("transform", function (d, i) { return "rotate(" + (i * 360 / params.directions) + ")"; });

    var labels = svg.append("g").selectAll("text")
        .data(params.labels)
        .enter().append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .attr("x", function (d, i) { return 0.9 * radius * Math.sin((i + 1) * 2 * Math.PI / params.directions); })
        .attr("y", function (d, i) { return 0.9 * radius * -Math.cos((i + 1) * 2 * Math.PI / params.directions); })
        .text(function (d, i) { return d; });

    var scaling_factor = (0.8 * radius) / max_radius;
    var arc = d3.arc()
        .outerRadius(function (d) { return (d.outerRadius * scaling_factor); })
        .innerRadius(function (d) { return (d.innerRadius * scaling_factor); })
        .startAngle(function (d) { return (d.directionGroup * (2 * Math.PI / params.directions)) - (Math.PI / params.directions); })
        .endAngle(function (d) { return (d.directionGroup * (2 * Math.PI / params.directions)) + (Math.PI / params.directions); });

    var arcs = svg.selectAll('path')
        .data(arc_data)
        .enter().append("path")
        .attr("d", arc)
        .style("fill", function (d) { return colorScale(d.scaleStep); })
        .style("stroke", "black")
        .style("stroke-width", "0.5px");

    var zero_label = svg.append("text")
        .attr("class", "calm-label")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", 0)
        .text(d3.format(".1%")(zero_frac) + " calm");

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (radius + 55) + "," + (-radius + 30) + ")")
        .selectAll("g")
        .data(params.legend_text)
        .enter().append("g");

    legend.append("rect")
        .attr("y", function (d, i) { return i * 25; })
        .attr("width", 40)
        .attr("height", 15)
        .style("fill", function (d, i) { return colorScale(i); });

    legend.append("text")
        .attr("x", 45)
        .attr("y", function (d, i) { return (i * 25) + 8; })
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d) { return d; });
};

function epwFloodPlot(data, params) {
    var color = d3.scaleLinear()
        .domain([params.min_value, params.max_value])
        .range([params.step_colors[0], params.step_colors[params.steps]]);

    var width = 700,
        height = 300,
        cellSize = 17,
        padding = 30;

    var svg = d3.select(params.id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    var x = d3.scaleLinear()
        .domain([1, 365])
        .range([0, width - padding]);

    var y = d3.scaleTime()
        .domain([new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23, 0)])
        .range([0, height - padding]);

    var xAxis = d3.axisTop()
        .scale(x)
        .ticks(12)
        .tickFormat(function (d) {
            return new Date(2000, d / 30, 1).toLocaleDateString('en-us', { month: 'short' });
        });

    var yAxis = d3.axisLeft()
        .scale(y)
        .ticks(24)
        .tickFormat(d3.timeFormat('%H'));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.selectAll(".hour")
        .data(data)
        .enter().append("rect")
        .attr("x", function (d) { return x(d.dayOfYear); })
        .attr("y", function (d) { return y(new Date(2000, 0, 1, d.hour, 0)); })
        .attr("class", "hour")
        .attr("width", cellSize)
        .attr("height", cellSize)
        .style("fill", function (d) { return color(d.value); });

    var legend = svg.selectAll(".legend")
        .data(color.range().map(function (d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) { return "translate(" + i * 31 + "," + (height - padding / 2) + ")"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 30)
        .attr("height", 10)
        .style("fill", function (d) { return color(d[0]); });

    legend.append("text")
        .attr("x", 0)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text(function (d) { return d3.format('.0f')(d[0]) + params.unit; });
};


export {clearEPWCharts, epwTempFloodPlot, epwCloudFloodPlot, epwWindRose};
