import React, { useEffect, useState } from 'react';
import { Card, Skeleton, Snackbar, Alert, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import { AiOutlineWarning } from 'react-icons/ai';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Dot
} from 'recharts';
import getColor from './colorscale';
import ArrowButton from './ArrowButton';
import ScatterPlot from './scatter';
import Co2BarChart from './barChart';
import co2Chart from './areachart';
import AnimatedNumber from './AnimatedNumber'; // Import AnimatedNumber
import './index.css';
import RadialChart from './radialChart';
import GaugeChart from './gaugeChart';
import SpiderChart from './radarChart';
import Slide from '@mui/material/Slide';

const Warning = ({ text }) => (
  <div className="warning">
    <AiOutlineWarning className="warning-icon" />
    <span className="warning-text">{text}</span>
  </div>
);

const AlertWarning = ({text}) => (
  <div className="warning">
    <AiOutlineWarning className="warning-icon" size={30}/>
    <span className="warning-text">{text}</span>
  </div>
);

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

async function fetchPythonBackendData(indoorImei, outdoorImei, guideline) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/data?imei=${indoorImei}&outdoor_imei=${outdoorImei}&guideline=${guideline}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}


const Co2DataCard = ({ selectedDevice, selectedOutdoorDevice, selectedGuideline, selectedIEWGuideline}) => {
  const [co2Data, setCo2Data] = useState([]);
  const [sensorData, setSensorData] = useState({});
  const [showAdvice, setShowAdvice] = useState(false);
  const [adviceMessage, setAdviceMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [histCo2Data, setHistCo2Data] = useState([]);
  const [iew, setIewData] = useState([]);

 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData(selectedDevice, selectedOutdoorDevice, selectedIEWGuideline);
        setCo2Data(data.co2_prev_day);
        setSensorData({
          timestamp: data.timestamp,
          indoor_co2: data.indoor_co2,
          indoor_pm25: data.indoor_pm25,
          indoor_temperature: data.indoor_temperature,
          humidity: data.humidity,
          tvoc: data.tvoc,
          outdoor_co2: data.outdoor_co2,
          co2_advice: data.co2_advice,
          temp_advice: data.temp_advice,
          aqi_advice: data.aqi_advice,
          iew: data.iew,
          iew_temp: data.iew_temp,
          iew_humidity: data.iew_humidity,
          iew_pm25: data.iew_pm25,
          iew_co2: data.iew_co2,
          iew_ach: data.iew_ach,
          iew_tvoc: data.iew_tvoc,
          wellness_index: data.wellness_index
        });

        setIewData(data.iew);
        console.log('iew', iew);

        setHistCo2Data(data.historical_co2_indoor);
        console.log('Historical CO2 Data:', data.historical_co2_indoor);
        

        if (data.co2_advice) {
          setShowAdvice(true);
          setAdviceMessage(data.co2_advice);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 120000); 
    return () => clearInterval(interval);
  }, [selectedDevice, selectedOutdoorDevice, selectedIEWGuideline]);

  const getSafeValue = (value) => (isNaN(value) ? 0 : value);

  const handleClose = () => {
    setShowAdvice(false);
  };

  const guidelines = {
    ISHRAE_A: {
        co2: getSafeValue(sensorData.outdoor_co2) + 350,
        pm25: 15,
        temp: { min: 23, max: 27 },
        humidity: { min: 30, max: 70 },
        tvoc: 200,
    },
    ISHRAE_B: {
        co2: getSafeValue(sensorData.outdoor_co2) + 500,
        pm25: 25,
        temp: { min: 23, max: 27 },
        humidity: { min: 30, max: 70 },
        tvoc: 400,
    },
    ISHRAE_C: {
      co2: getSafeValue(sensorData.outdoor_co2) + 700,
      pm25: 25,
      temp: { min: 23, max: 27 },
      humidity: { min: 30, max: 70 },
      tvoc: 500,
  },
    LEED_min: {
      co2: 1000,
      pm25: 25,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 120,
  },
    LEED_EN: {
      co2: 800,
      pm25: 12,
      temp: { min: 23, max: 27 },
      humidity: { min: 30, max: 70 },
      tvoc: 'n/a',
    },
    RESET_min: {
      co2: 1000,
      pm25: 35,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 500,
    },
    RESET_hp: {
      co2: 600,
      pm25: 25,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 400,
    },
    IGBC: {
      co2: sensorData.outdoor_co2 + 530,
      pm25: 25,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 500,
    },
    GRIHA: {
      co2: 1000,
      pm25: 25,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 500,
    },
    WHO: {
      co2: 'n/a',
      pm25: 10,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 500,
    },
    ASHRAE: {
      co2: 1000,
      pm25: 15,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 'n/a',
    },
    US_EPA: {
      co2: 1000,
      pm25: 12,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 'n/a',
    },
    NBC_INDIA: {
      co2: 1000,
      pm25: 15,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 600,
    },
    WELL: {
      co2: 800,
      pm25: 15,
      temp: { min: 22, max: 28 },
      humidity: { min: 35, max: 65 },
      tvoc: 500,
    },
  };

  const selectedThresholds = guidelines[selectedGuideline];

    const [showRadialCharts, setShowRadialCharts] = useState(false);
  
    const toggleRadialCharts = () => {
      setShowRadialCharts(!showRadialCharts);
    };


  return (
    <Card className="p-4 shadow-none rounded-lg">
      <div className="flex gap-6">
        <div className="w-2/3 pb-0">
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={co2Data}>
              <defs>
                <linearGradient id='co2level' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset="5%" stopColor={getColor(sensorData.indoor_co2, 'co2')} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={getColor(sensorData.indoor_co2, 'co2')} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(time) => {
                const hours = new Date(time).getHours();
                return `${hours}`;
              }} />
              <YAxis domain={[0, 3000]} label={{ value: 'Carbon Dioxide levels (PPM)', angle: -90, position: 'Center', dx: -22, dy: 10 }} />
              <Tooltip />
              <ReferenceLine y={selectedThresholds.co2} label={{ value: "Threshold limit", position: "insideRight", fill: "black", fontSize: 12, fontWeight: "bold", dy: -10 }} stroke="red" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="co2" stroke={getColor(sensorData.indoor_co2, 'co2')} fill="url(#co2level)" 
                    dot = {true}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className='w-1/3'>
          <Card className="shadow-none rounded-lg md:flex gap-6">
            <div className="flex justify-between w-full">
              <div className="ml-6">
                <p className="mt-[18px] text-l font-bold">Ambient CO2 Levels (ppm)</p>
                <div className="pt-3">
                  {sensorData ? (
                    <h3 className="text-s">
                      Outdoor Carbon Dioxide levels
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
              <div className="flex items-center ">
                <div className="border-l-2 border-gray-300 h-full ml-0 mr-4"></div>
                {sensorData ? (
                  <p className="text-3xl font-bold" style={{ color: getColor(sensorData.outdoor_co2, 'co2') }}>
                    <AnimatedNumber value={getSafeValue(sensorData.outdoor_co2)} duration={1000} /> <span className="text-xl"> ppm </span>
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

          <Card className="shadow-none rounded-lg md:flex gap-6">
            {sensorData.co2_advice && <Warning text={sensorData.co2_advice} />}
            {sensorData.temp_advice && <Warning text={sensorData.temp_advice} />}
            {sensorData.aqi_advice && <Warning text={sensorData.aqi_advice} />}
          </Card>
        </div>
      </div>
      <div className="flex overflow-x-auto">
        <Card className=" shadow-none rounded-lg flex gap-6">
          <div>
            <Card className="shadow-none rounded-lg flex p-0">
              <div className="flex justify-between w-full ">
                <div className="ml-6 mr-0">
                  <p className="mt-[18px] text-l font-bold">CO2 Levels (ppm)</p>
                  <div className="">
                    {sensorData ? (
                      <h3 className="text-s ">
                        Indoor threshold limit: <span className='text-red-500'>{selectedThresholds.co2} ppm</span>
                      </h3>
                    ) : (
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "30px !important",
                          lineHeight: "32px !important",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="border-l-2 border-gray-300 h-full"></div>
                  {sensorData ? (
                    <p className="text-3xl font-bold ml-2 mr-0" style={{ color: getColor(sensorData.indoor_co2, 'co2') }}>
                      <AnimatedNumber value={getSafeValue(sensorData.indoor_co2)} duration={1000} /> <span className="text-l align-text-bottom"> ppm </span>
                    </p>
                  ) : (
                    <Skeleton
                      variant="text"
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
            <Card className="shadow-none rounded-lg flex gap-6">
              <div className="flex justify-between w-full">
                <div className="ml-6 mr-0">
                  <p className="mt-[18px] text-l font-bold">PM 2.5 Concentration</p>
                  <div className="mr-0">
                    {sensorData ? (
                      <h3 className=" text-s">Indoor threshold limit: <span className='text-red-500'>{selectedThresholds.pm25} µg/m³</span></h3>
                    ) : (
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "30px !important",
                          lineHeight: "32px !important",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="border-l-2 border-gray-300 h-full"></div>
                  {sensorData ? (
                    <p className="text-3xl font-bold ml-2" style={{ color: getColor(sensorData.indoor_pm25, 'pm25') }}>
                      <AnimatedNumber value={getSafeValue(sensorData.indoor_pm25)} duration={1000} /> <span className="text-l align-text-bottom"> µg/m³ </span>
                    </p>
                  ) : (
                    <Skeleton
                      variant="text"
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
            <Card className="shadow-none rounded-lg flex gap-6">
              <div className="flex justify-between w-full">
                <div className="ml-6 mr-0">
                  <p className="mt-[18px] text-l font-bold">Zone air temperature</p>
                  <div className="">
                    {sensorData ? (
                      <h3 className="text-s">Comfort range: <span className='text-green-500'>{selectedThresholds.temp.min}°C - {selectedThresholds.temp.max}°C</span></h3>
                    ) : (
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "30px !important",
                          lineHeight: "32px !important",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="border-l-2 border-gray-300 h-full"></div>
                  {sensorData ? (
                    <p className="text-3xl font-bold ml-2" style={{ color: getColor(sensorData.indoor_temperature, 'temp') }}>
                      <AnimatedNumber value={getSafeValue(sensorData.indoor_temperature)} duration={1000} /> <span className="text-l align-text-bottom"> °C </span>
                    </p>
                  ) : (
                    <Skeleton
                      variant="text"
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
            <Card className="shadow-none rounded-lg flex gap-6">
              <div className="flex justify-between w-full">
                <div className="ml-6 mr-0">
                  <p className="mt-[18px] text-l font-bold">Humidity</p>
                  <div className="">
                    {sensorData ? (
                      <h3 className=" text-s">Comfort range: <span className='text-green-500'>{selectedThresholds.humidity.min}% - {selectedThresholds.humidity.max}%</span></h3>
                    ) : (
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "30px !important",
                          lineHeight: "32px !important",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="border-l-2 border-gray-300 h-full"></div>
                  {sensorData ? (
                    <p className="text-3xl font-bold ml-2" style={{ color: getColor(sensorData.humidity, 'humidity') }}>
                      <AnimatedNumber value={getSafeValue(sensorData.humidity)} duration={1000} /> <span className="text-l align-text-bottom"> % </span>
                    </p>
                  ) : (
                    <Skeleton
                      variant="text"
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
            <Card className="shadow-none rounded-lg flex p-0">
              <div className="flex justify-between w-full ">
                <div className="ml-6 mr-0">
                  <p className="mt-[18px] text-l font-bold">TVOC index</p>
                  <div className="">
                    {sensorData ? (
                      <h3 className="text-s">
                        Indoor threshold limit: <span className='text-red-500'>{selectedThresholds.tvoc} µg/m³</span>
                      </h3>
                    ) : (
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "30px !important",
                          lineHeight: "32px !important",
                        }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="border-l-2 border-gray-300 h-full"></div>
                  {sensorData ? (
                    <p className="text-3xl font-bold ml-2 mr-0" style={{ color: getColor(sensorData.tvoc, 'tvoc') }}>
                      <AnimatedNumber value={getSafeValue(sensorData.tvoc)} duration={1000} /> <span className="text-l align-text-bottom"> µg/m³</span>
                    </p>
                  ) : (
                    <Skeleton
                      variant="text"
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
      </div>
      <div className="charts-container">
        <div className='chart-wrapper flex '>
            <GaugeChart value = {sensorData.wellness_index}/>
            <SpiderChart data = {sensorData} color={getColor(sensorData.wellness_index, 'iew')}/>   
        </div>
        <div className="chart-wrapper">
          <Co2BarChart co2Data={histCo2Data} /> 
        </div>
      </div>
      
      {/* <Dialog
        open={showAdvice} 
        onClose={handleClose}
        TransitionComponent={Transition}
        keepMounted
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle >Advice to maintain air quality</DialogTitle>
        <DialogContent>
          <AlertWarning text={adviceMessage} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>  */}

      {sensorData.co2_advice && (
        <Snackbar open={showAdvice} autoHideDuration={null} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%', fontWeight: 'bold', fontSize: '1.2em', alignItems: 'center', justifyContent: 'center' }}>
            {adviceMessage}
          </Alert>
        </Snackbar>
      )}
    </Card>
  );
};

export default Co2DataCard;

