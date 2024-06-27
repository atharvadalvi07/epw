import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Card } from '@mui/material';
import './ScatterPlot.css';

// Function to fetch data from the Python backend
async function fetchPythonBackendData(imei, outdoorImei) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/data?imei=${imei}&outdoor_imei=${outdoorImei}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}

function ScatterPlot({ selectedDevice, selectedOutdoorDevice }) {
  const [data, setData] = useState([]);
  const [outdoorData, setOutdoorData] = useState([]);
  const [currentIndoorData, setCurrentIndoorData] = useState(null);
  const [currentOutdoorData, setCurrentOutdoorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPythonBackendData(selectedDevice, selectedOutdoorDevice);
        const humidityDataIndoor = response.historical_humidity_indoor;
        const temperatureDataIndoor = response.historical_temperature_indoor;
        const humidityDataOutdoor = response.historical_humidity_outdoor;
        const temperatureDataOutdoor = response.historical_temperature_outdoor;

        const combinedIndoorData = humidityDataIndoor.map((humidityEntry) => {
          const temperatureEntry = temperatureDataIndoor.find(
            (tempEntry) => tempEntry.time === humidityEntry.time
          );
          return {
            time: humidityEntry.time,
            humidity: humidityEntry.humidity,
            temp: temperatureEntry ? temperatureEntry.temp : null,
          };
        });

        const combinedOutdoorData = humidityDataOutdoor.map((humidityEntry) => {
          const temperatureEntry = temperatureDataOutdoor.find(
            (tempEntry) => tempEntry.time === humidityEntry.time
          );
          return {
            time: humidityEntry.time,
            humidity: humidityEntry.humidity,
            temp: temperatureEntry ? temperatureEntry.temp : null,
          };
        });

        setData(combinedIndoorData);
        setOutdoorData(combinedOutdoorData);
        setCurrentIndoorData({ temp: response.indoor_temperature, humidity: response.humidity });
        setCurrentOutdoorData({ temp: response.outdoor_temperature, humidity: response.humidity });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Fetch data every 5 minutes
    return () => clearInterval(interval);
  }, [selectedDevice, selectedOutdoorDevice]);

  const box = {
    x1: 23,
    x2: 27,
    y1: 30,
    y2: 70
  };

  return (
    <Card className="p-0 shadow-none rounded-lg">
      <div style={{ width: '100%', height: 350, position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
            <p>Loading...</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ right: 20, bottom: 10, left: 10 }}
          >
            <CartesianGrid />
            <XAxis type="number" dataKey="temp" name="Temperature" unit="°C" domain={[10, 40]} />
            <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            {!loading && !error && (
              <>
                <ReferenceArea
                  x1={box.x1}
                  x2={box.x2}
                  y1={box.y1}
                  y2={box.y2}
                  fill="#BCBCBC"
                  fillOpacity={0.5}
                  label={{ value: "Comfort Range", position: "top", fill: "black", fontSize: 12, fontWeight: "bold" }}
                />
                <Scatter name="Outdoor Temp" data={outdoorData} fill="#82ca9d" />
                <Scatter name="Indoor Temp" data={data} fill="#fcd303" />
                <Scatter className="blink" name="Current Indoor temp" data={[currentIndoorData]} fill="red" />
                <Scatter className="blink" name="Current Outdoor temp" data={[currentOutdoorData]} fill="darkgreen" />
                
              </>
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default ScatterPlot;

/*import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Card, Select, MenuItem } from '@mui/material';
import './ScatterPlot.css';

// Function to fetch data from the Python backend
async function fetchPythonBackendData(imei, outdoorImei) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/data?imei=${imei}&outdoor_imei=${outdoorImei}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}

function ScatterPlot({ selectedDevice, selectedOutdoorDevice}) { // Receive selectedDevice as a prop
  const [data, setData] = useState([]);
  const [outdoorData, setOutdoorData] = useState([]);
  const [currentIndoorData, setCurrentIndoorData] = useState(null);
  const [currentOutdoorData, setCurrentOutdoorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  //const [selectedOutdoorDevice, setSelectedOutdoorDevice] = useState('500291EC2742');


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPythonBackendData(selectedDevice, selectedOutdoorDevice);
        const humidityDataIndoor = response.historical_humidity_indoor;
        const temperatureDataIndoor = response.historical_temperature_indoor;
        const humidityDataOutdoor = response.historical_humidity_outdoor;
        const temperatureDataOutdoor = response.historical_temperature_outdoor;

        const combinedIndoorData = humidityDataIndoor.map((humidityEntry) => {
          const temperatureEntry = temperatureDataIndoor.find(
            (tempEntry) => tempEntry.time === humidityEntry.time
          );
          return {
            time: humidityEntry.time,
            humidity: humidityEntry.humidity,
            temp: temperatureEntry ? temperatureEntry.temp : null,
          };
        });

        const combinedOutdoorData = humidityDataOutdoor.map((humidityEntry) => {
          const temperatureEntry = temperatureDataOutdoor.find(
            (tempEntry) => tempEntry.time === humidityEntry.time
          );
          return {
            time: humidityEntry.time,
            humidity: humidityEntry.humidity,
            temp: temperatureEntry ? temperatureEntry.temp : null,
          };
        });

        setData(combinedIndoorData);
        setOutdoorData(combinedOutdoorData);
        setCurrentIndoorData({ temp: response.indoor_temperature, humidity: response.humidity });
        setCurrentOutdoorData({ temp: response.outdoor_temperature, humidity: response.humidity });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Fetch data every 5 minutes
    return () => clearInterval(interval);
  }, [selectedDevice, selectedOutdoorDevice]);

  const box = {
    x1: 23,
    x2: 27,
    y1: 30,
    y2: 70
  };

  return (
    <Card className="p-6 shadow-none rounded-lg">
      <div style={{ width: '100%', height: 350 }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{  right: 20, bottom: 10, left: 10 }}
            >
              <CartesianGrid />
              <XAxis type="number" dataKey="temp" name="Temperature" unit="°C" domain={[10, 40]}/>
              <YAxis type="number" dataKey="humidity" name="Humidity" unit="%" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Outdoor Temp " data={outdoorData} fill="#82ca9d" />
              <Scatter name="Indoor Temp " data={data} fill="#fcd303" />
              <Scatter className="blink" name="Current Indoor temp" data={[currentIndoorData]} fill="red" />
              <Scatter className="blink" name="Current Outdoor temp" data={[currentOutdoorData]} fill="darkgreen" />
              <ReferenceArea
                x1={box.x1}
                x2={box.x2}
                y1={box.y1}
                y2={box.y2}
                stroke="black"
                strokeOpacity={1}
                fill="none"
                label={{ value: "Comfort Range", position: "top", fill: "black", fontSize: 12, fontWeight: "bold" }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export default ScatterPlot;
*/