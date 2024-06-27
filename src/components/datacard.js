"use client";
import { Card, Skeleton } from "@mui/material";
import React, { useEffect, useState } from "react";
import getColor from './colorscale';
import ArrowButton from './ArrowButton';
import ReactDOM from 'react-dom';
//import AppRouter from '../AppRoute';


async function fetchPythonBackendData() {
  try {
    const res = await fetch('http://127.0.0.1:5000/data');
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}

const DataCard = () => {
  const [epwData, setEpwData] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData();
        setSensorData(data);
        console.log("sensor data", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  return (
    <Card className="p-6 shadow-none rounded-lg ">
    <div className="sm:m-10">
      <div className="mb-6 text-left">
        <p className="text-xl font-bold">Sensory data for office 603:</p>
      </div>
      <Card className="p-6 shadow-none rounded-lg md:flex gap-6">
        <div>
          <Card className="shadow-none rounded-lg md:flex gap-6">
            <div className="flex justify-between w-full">
              <div className="ml-6">
                <p className="mt-[18px] text-l font-bold">CO2 Levels (ppm)</p>
                <div className="pt-3">
                  {sensorData ? (
                    <h3 className="text-s">
                      Data seen until {sensorData.timestamp}
                    </h3>
                  ) : (
                    <Skeleton
                      varitant="text"
                      sx={{
                        fontSize: "30px !important",
                        lineHeight: "32px !important",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center mx-4">
                <div className="border-l-2 border-gray-300 h-full mx-4"></div>
                {sensorData ? (
                  <p className="text-3xl font-bold" style={{ color: getColor(sensorData.indoor_co2, 'co2') }}>
                    {sensorData.indoor_co2} <span className="text-xl"> ppm </span>
                  </p>
                ) : (
                  <Skeleton
                    varitant="text"
                    sx={{
                      fontSize: "30px !important",
                      lineHeight: "32px !important",
                    }}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card className="shadow-none rounded-lg md:flex gap-6">
            <div className="flex justify-between w-full">
              <div className="ml-6">
                <p className="mt-[18px] text-l font-bold">PM 2.5 Concentration</p>
                <div className="pt-3">
                  {sensorData ? (
                    <h3 className=" text-s">Average PM2.5 levels maintained in office</h3>
                  ) : (
                    <Skeleton
                      varitant="text"
                      sx={{
                        fontSize: "30px !important",
                        lineHeight: "32px !important",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center mx-4">
                <div className="border-l-2 border-gray-300 h-full mx-4"></div>
                {sensorData ? (
                  <p className="text-3xl font-medium text-red-500" style={{ color: getColor(sensorData.indoor_pm25, 'pm25') }}>
                    {sensorData.indoor_pm25} <span className="text-xl"> µg/m³ </span>
                  </p>
                ) : (
                  <Skeleton
                    varitant="text"
                    sx={{
                      fontSize: "30px !important",
                      lineHeight: "32px !important",
                    }}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card className="shadow-none rounded-lg md:flex gap-6">
            <div className="flex justify-between w-full">
              <div className="ml-6">
                <p className="mt-[18px] text-l font-bold">Zone air temperature</p>
                <div className="pt-3">
                  {sensorData ? (
                    <h3 className="text-s">Data seen until {sensorData.timestamp}</h3>
                  ) : (
                    <Skeleton
                      varitant="text"
                      sx={{
                        fontSize: "30px !important",
                        lineHeight: "32px !important",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center mx-4">
                <div className="border-l-2 border-gray-300 h-full mx-4"></div>
                {sensorData ? (
                  <p className="text-3xl font-medium text-green-500" style={{ color: getColor(sensorData.indoor_temperature, 'temp') }}>
                    {sensorData.indoor_temperature} <span className="text-xl"> °C </span>
                  </p>
                ) : (
                  <Skeleton
                    varitant="text"
                    sx={{
                      fontSize: "30px !important",
                      lineHeight: "32px !important",
                    }}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
        <div>
          <Card className="shadow-none rounded-lg md:flex gap-6">
            <div className="flex justify-between w-full">
              <div className="ml-6">
                <p className="mt-[18px] text-l font-bold">Humidity</p>
                <div className="pt-3">
                  {sensorData ? (
                    <h3 className=" text-s">Data seen until {sensorData.timestamp}</h3>
                  ) : (
                    <Skeleton
                      varitant="text"
                      sx={{
                        fontSize: "30px !important",
                        lineHeight: "32px !important",
                      }}
                    />
                  )}
                </div>
              </div>
              <div className="flex items-center mx-4">
                <div className="border-l-2 border-gray-300 h-full mx-4"></div>
                {sensorData ? (
                  <p className="text-3xl font-bold" style={{ color: getColor(sensorData.humidity, 'humidity') }}>
                    {sensorData.humidity} <span className="text-xl"> % </span>
                  </p>
                ) : (
                  <Skeleton
                    varitant="text"
                    sx={{
                      fontSize: "30px !important",
                      lineHeight: "32px !important",
                    }}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>
      </Card>
      <ArrowButton/>
    </div>
    </Card>
  );
};

export default DataCard;
