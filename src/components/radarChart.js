import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer, Tooltip} from "recharts";

const SpiderChart = ({data, color}) => {

    const radarData = [
        {"pollutant": 'humidity', 'value': data.iew_humidity},
        {"pollutant": 'pm2.5', 'value': data.iew_pm25},
        {"pollutant": 'ACH', 'value': data.iew_ach},
        {"pollutant": 'CO2', 'value': data.iew_co2},
        {"pollutant": 'Temperature', 'value': data.iew_temp},
        {"pollutant": 'TVOC', 'value': data.iew_tvoc}
    ];
    console.log("co2", data.iew_co2)
    return(
        <ResponsiveContainer width="100%" height={250}>
            <br/>
        <RadarChart outerRadius={90} width={200} height={250} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="pollutant" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar name="IEW index" dataKey="value" stroke={color} fill={color} fillOpacity={0.6} />
            <Tooltip/>
            
            
        </RadarChart>
        </ResponsiveContainer>
    );

}

export default SpiderChart;

