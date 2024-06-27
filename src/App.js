import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MenuItem, Select, FormControl, InputLabel, Tooltip, IconButton, Card } from "@mui/material";
import './globals.css';
import Co2DataCard from './components/co2data';
import GraphSet from './graphs/page'; 
import GuidelineInfo from './guidelineInfo';

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

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [outdoorData, setOutdoorData] = useState(null);
  const [co2Data, setCo2Data] = useState([]);
  const [outdoorCo2Data, setOutdoorCo2Data] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('18FE34E3DFC1');
  const [selectedOutdoorDevice, setSelectedOutdoorDevice] = useState('2CF4328C5A18');
  const [selectedGuideline, setSelectedGuideline] = useState('ISHRAE_A');
  const [selectedIEWGuideline, setSelectedIEWGuideline] = useState('Wellness');

  const handleGuidelineChange = (event) => {
    setSelectedGuideline(event.target.value);
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  const handleOutdoorDeviceChange = (event) => {
    setSelectedOutdoorDevice(event.target.value);
  };

  const handleIEWGuidelineChange = (event) => {
    setSelectedIEWGuideline(event.target.value);
  }

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData(selectedDevice, selectedOutdoorDevice, selectedIEWGuideline);
        setSensorData(data);
        setOutdoorData(data); 
        setCo2Data(data.co2_prev_day);
        setOutdoorCo2Data(data.co2_prev_day);
        console.log("sensor data", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getData();
    //const interval = setInterval(getData, 6000000); // Fetch data every 5 minutes
    //return () => clearInterval(interval);
  }, [selectedDevice, selectedOutdoorDevice]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="page-header" style={{ scrollPaddingTop: '5px', paddingBottom: '5px' }}>
            <Card className="pt-6 pb-6 mt-15 shadow-none rounded-none">
              <div className="flex items-center p-2">
                <Link to="/">
                  <img
                    className="w-12 h-12 rounded-full"
                    height={48}
                    width={48}
                    src="respirer.png"
                    alt="Respirer logo"
                  />
                </Link>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                  }}
                >
                  <div
                    style={{
                      paddingTop: 7,
                      color: 'black',
                      fontSize: 24,
                      fontFamily: 'Calibri',
                      fontWeight: '700',
                      wordWrap: 'break-word',
                      paddingRight: 20,
                    }}
                  >
                    Indoor Air Quality Dashboard
                  </div>
                  <div className="flex gap-4">
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select Indoor Device</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedDevice}
                        onChange={handleDeviceChange}
                        label="Select Indoor Device"
                      >
                        <MenuItem value="18FE34E3DFC1">1st floor</MenuItem>
                        <MenuItem value="4C11AE131B88">Ground floor</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="outdoor-device-select-label">Select Outdoor Device</InputLabel>
                      <Select
                        labelId="outdoor-device-select-label"
                        value={selectedOutdoorDevice}
                        onChange={handleOutdoorDeviceChange}
                        label="Select Outdoor Device"
                      >
                        <MenuItem value="2CF4328C5A18">Outdoor Device 1</MenuItem>
                        <MenuItem value="500291EC2742">Outdoor Device 2</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select Compliance</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedGuideline}
                        onChange={handleGuidelineChange}
                        label="Select Compliance"
                      >
                        <MenuItem value="ISHRAE_A">ISHRAE Class A</MenuItem>
                        <MenuItem value="ISHRAE_B">ISHRAE Class B</MenuItem>
                        <MenuItem value="ISHRAE_C">ISHRAE Class C</MenuItem>
                        <MenuItem value="LEED_min">LEED (min)</MenuItem>
                        <MenuItem value="LEED_EN">LEED (enhanced)</MenuItem>
                        <MenuItem value="RESET_min">RESET (min)</MenuItem>
                        <MenuItem value="RESET_hp">RESET (high performance)</MenuItem>
                        <MenuItem value="IGBC">IGBC</MenuItem>
                        {/* <MenuItem value="GRIHA">GRIHA</MenuItem> 
                        <MenuItem value="WHO">WHO</MenuItem>*/} 
                        <MenuItem value="ASHRAE">ASHRAE</MenuItem>
                        {/* <MenuItem value="US_EPA">US EPA</MenuItem> */}
                        <MenuItem value="NBC_INDIA">NBC INDIA</MenuItem>
                        <MenuItem value="WELL">WELL</MenuItem>
                      </Select>
                    </FormControl>
                    <Tooltip
                      title={<GuidelineInfo selectedGuideline={selectedGuideline} />}
                      placement="right"
                    >
                      <IconButton>
                        <img
                          className=" p-0 w-10 h-10 rounded-full"
                          height={15}
                          width={15}
                          src="images.png"
                          alt="Information icon"
                        />
                      </IconButton>
                    </Tooltip>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select IEW guideline</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedIEWGuideline}
                        onChange={handleIEWGuidelineChange}
                        label="Select IEW guideline"
                      >
                        <MenuItem value="TC">Thermal Comfort Focus</MenuItem>
                        <MenuItem value="AQ">Air Quality Focus</MenuItem>
                        <MenuItem value="PP">Pollution Protection</MenuItem>
                        <MenuItem value="GG">Green Guardian</MenuItem>
                        <MenuItem value="Wellness">Overall Wellness</MenuItem>
                      </Select>
                    </FormControl>
                    
                  </div>
                </div>
              </div>
            </Card>
          </div>
        } />

        <Route path="/graphs" element={<GraphSet />} />
      </Routes>
      <div style={{ padding: 20 }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : sensorData ? (
          <div>
            <Co2DataCard selectedDevice={selectedDevice} selectedOutdoorDevice={selectedOutdoorDevice} selectedGuideline={selectedGuideline} selectedIEWGuideline={selectedIEWGuideline}/>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </Router>
  );
}

export default App;
/*import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { MenuItem, Select, FormControl, InputLabel, Tooltip, IconButton, Card } from "@mui/material";
import './globals.css';
import Co2DataCard from './components/co2data';
import GraphSet from './graphs/page'; 
import GuidelineInfo from './guidelineInfo';

async function fetchPythonBackendData(indoorImei, outdoorImei) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/data?imei=${indoorImei}&outdoor_imei=${outdoorImei}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [outdoorData, setOutdoorData] = useState(null);
  const [co2Data, setCo2Data] = useState([]);
  const [outdoorCo2Data, setOutdoorCo2Data] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('18FE34E3DFC1');
  const [selectedOutdoorDevice, setSelectedOutdoorDevice] = useState('2CF4328C5A18');
  const [selectedGuideline, setSelectedGuideline] = useState('ISHRAE_A');
  const [selectedIEWGuideline, setSelectedIEWGuideline] = useState('Wellness');

  const handleGuidelineChange = (event) => {
    setSelectedGuideline(event.target.value);
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  const handleOutdoorDeviceChange = (event) => {
    setSelectedOutdoorDevice(event.target.value);
  };

  const handleIEWGuidelineChange = (event) => {
    setSelectedIEWGuideline(event.target.value);
  }

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData(selectedDevice, selectedOutdoorDevice);
        setSensorData(data);
        setOutdoorData(data); 
        setCo2Data(data.co2_prev_day);
        setOutdoorCo2Data(data.co2_prev_day);
        console.log("sensor data", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getData();
    //const interval = setInterval(getData, 6000000); // Fetch data every 5 minutes
    //return () => clearInterval(interval);
  }, [selectedDevice, selectedOutdoorDevice]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="page-header" style={{ scrollPaddingTop: '5px', paddingBottom: '5px' }}>
            <Card className="pt-6 pb-6 mt-15 shadow-none rounded-none">
              <div className="flex items-center p-2">
                <Link to="/">
                  <img
                    className="w-12 h-12 rounded-full"
                    height={48}
                    width={48}
                    src="respirer.png"
                    alt="Respirer logo"
                  />
                </Link>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                  }}
                >
                  <div
                    style={{
                      paddingTop: 7,
                      color: 'black',
                      fontSize: 24,
                      fontFamily: 'Calibri',
                      fontWeight: '700',
                      wordWrap: 'break-word',
                      paddingRight: 20,
                    }}
                  >
                    Indoor Air Quality Dashboard
                  </div>
                  <div className="flex gap-4">
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select Indoor Device</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedDevice}
                        onChange={handleDeviceChange}
                        label="Select Indoor Device"
                      >
                        <MenuItem value="18FE34E3DFC1">1st floor</MenuItem>
                        <MenuItem value="4C11AE131B88">Ground floor</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="outdoor-device-select-label">Select Outdoor Device</InputLabel>
                      <Select
                        labelId="outdoor-device-select-label"
                        value={selectedOutdoorDevice}
                        onChange={handleOutdoorDeviceChange}
                        label="Select Outdoor Device"
                      >
                        <MenuItem value="2CF4328C5A18">Outdoor Device 1</MenuItem>
                        <MenuItem value="500291EC2742">Outdoor Device 2</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select Compliance</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedGuideline}
                        onChange={handleGuidelineChange}
                        label="Select Compliance"
                      >
                        <MenuItem value="ISHRAE_A">ISHRAE Class A</MenuItem>
                        <MenuItem value="ISHRAE_B">ISHRAE Class B</MenuItem>
                        <MenuItem value="ISHRAE_C">ISHRAE Class C</MenuItem>
                        <MenuItem value="LEED_min">LEED (min)</MenuItem>
                        <MenuItem value="LEED_EN">LEED (enhanced)</MenuItem>
                        <MenuItem value="RESET_min">RESET (min)</MenuItem>
                        <MenuItem value="RESET_hp">RESET (high performance)</MenuItem>
                        <MenuItem value="IGBC">IGBC</MenuItem>
                        {/* <MenuItem value="GRIHA">GRIHA</MenuItem>
                        <MenuItem value="WHO">WHO</MenuItem> 
                        <MenuItem value="ASHRAE">ASHRAE</MenuItem>
                        {/* <MenuItem value="US_EPA">US EPA</MenuItem> 
                        <MenuItem value="NBC_INDIA">NBC INDIA</MenuItem>
                        <MenuItem value="WELL">WELL</MenuItem>
                      </Select>
                    </FormControl>
                    <Tooltip
                      title={<GuidelineInfo selectedGuideline={selectedGuideline} />}
                      placement="right"
                    >
                      <IconButton>
                        <img
                          className=" p-0 w-10 h-10 rounded-full"
                          height={15}
                          width={15}
                          src="images.png"
                          alt="Information icon"
                        />
                      </IconButton>
                    </Tooltip>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select IEW guideline</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedIEWGuideline}
                        onChange={handleIEWGuidelineChange}
                        label="Select IEW guideline"
                      >
                        <MenuItem value="TC">Thermal Comfort Focus</MenuItem>
                        <MenuItem value="AQ">Air Quality Focus</MenuItem>
                        <MenuItem value="PP">Pollution Protection</MenuItem>
                        <MenuItem value="GG">Green Guardian</MenuItem>
                        <MenuItem value="Wellness">Overall Wellness</MenuItem>
                      </Select>
                    </FormControl>
                    
                  </div>
                </div>
              </div>
            </Card>
          </div>
        } />

        <Route path="/graphs" element={<GraphSet />} />
      </Routes>
      <div style={{ padding: 20 }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : sensorData ? (
          <div>
            <Co2DataCard selectedDevice={selectedDevice} selectedOutdoorDevice={selectedOutdoorDevice} selectedGuideline={selectedGuideline} />
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </Router>
  );
}

export default App;

/*import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Grid, MenuItem, Select, FormControl, InputLabel, Tooltip, IconButton } from "@mui/material";
import './globals.css';
import Co2DataCard from './components/co2data';
import GraphSet from './graphs/page'; 
import Card from "@mui/material/Card";
import {Link} from "react-router-dom";


async function fetchPythonBackendData(indoorImei, outdoorImei) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/data?imei=${indoorImei}&outdoor_imei=${outdoorImei}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [outdoorData, setOutdoorData] = useState(null);
  const [co2Data, setCo2Data] = useState([]);
  const [outdoorCo2Data, setOutdoorCo2Data] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('18FE34E3DFC1');
  const [selectedOutdoorDevice, setSelectedOutdoorDevice] = useState('2CF4328C5A18');
  const [selectedGuideline, setSelectedGuideline] = useState('ISHRAE_A');

  const handleGuidelineChange = (event) => {
    setSelectedGuideline(event.target.value);
  };

  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  const handleOutdoorDeviceChange = (event) => {
    setSelectedOutdoorDevice(event.target.value);
  };

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData(selectedDevice, selectedOutdoorDevice);
        setSensorData(data);
        setOutdoorData(data); // assuming data contains both indoor and outdoor info
        setCo2Data(data.co2_prev_day);
        setOutdoorCo2Data(data.co2_prev_day);
        console.log("sensor data", data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getData();
    //const interval = setInterval(getData, 6000000); // Fetch data every 5 minutes
    //return () => clearInterval(interval);
  }, [selectedDevice, selectedOutdoorDevice]);

  return (
<Router>
      <Routes>
        <Route path="/overview" element={
          <div style={{ paddingBottom: '5px' }}>
            <Card className="pt-6 pb-6 mt-6 shadow-none rounded-none">
              <div className="flex items-center p-2">
                <Link to="/">
                  <img
                    className="w-12 h-12 rounded-full"
                    height={48}
                    width={48}
                    src="respirer.png"
                    alt="Respirer logo"
                  />
                </Link>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                  }}
                >
                  <div
                    style={{
                      paddingTop: 7,
                      color: 'black',
                      fontSize: 24,
                      fontFamily: 'Calibri',
                      fontWeight: '700',
                      wordWrap: 'break-word',
                      paddingRight: 20,
                    }}
                  >
                    Indoor Air Quality Dashboard
                  </div>
                  <div className="flex gap-4">
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select Indoor Device</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedDevice}
                        onChange={handleDeviceChange}
                        label="Select Indoor Device"
                      >
                        <MenuItem value="18FE34E3DFC1">1st floor</MenuItem>
                        <MenuItem value="4C11AE131B88">Ground floor</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="outdoor-device-select-label">Select Outdoor Device</InputLabel>
                      <Select
                        labelId="outdoor-device-select-label"
                        value={selectedOutdoorDevice}
                        onChange={handleOutdoorDeviceChange}
                        label="Select Outdoor Device"
                      >
                        <MenuItem value="2CF4328C5A18">Outdoor Device 1</MenuItem>
                        <MenuItem value="500291EC2742">Outdoor Device 2</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl variant="outlined" style={{ minWidth: 200 }}>
                      <InputLabel id="device-select-label">Select Compliance</InputLabel>
                      <Select
                        labelId="device-select-label"
                        value={selectedGuideline}
                        onChange={handleGuidelineChange}
                        label="Select Compliance"
                      >
                        <MenuItem value="ISHRAE_A">ISHRAE Class A</MenuItem>
                        <MenuItem value="ISHRAE_B">ISHRAE Class B</MenuItem>
                        <MenuItem value="ISHRAE_C">ISHRAE Class C</MenuItem>
                        <MenuItem value="LEED_min">LEED (min)</MenuItem>
                        <MenuItem value="LEED_EN">LEED (enhanced)</MenuItem>
                        <MenuItem value="RESET_min">RESET (min)</MenuItem>
                        <MenuItem value="RESET_hp">RESET (high performance)</MenuItem>
                        <MenuItem value="IGBC">IGBC</MenuItem>
                        <MenuItem value="GRIHA">GRIHA</MenuItem>
                        <MenuItem value="WHO">WHO</MenuItem>
                        <MenuItem value="ASHRAE">ASHRAE</MenuItem>
                        <MenuItem value="US_EPA">US EPA</MenuItem>
                        <MenuItem value="NBC_INDIA">NBC INDIA</MenuItem>
                        <MenuItem value="WELL">WELL</MenuItem>
                      </Select>
                    </FormControl>
                    <Tooltip title="Information about compliance guidelines">
                      <IconButton>
                      <img
                      className="w-12 h-12 rounded-full"
                      height={20}
                      width={20}
                      src="images.png"
                      alt="Respirer logo"
                      />  
                      </IconButton>
                    </Tooltip>
                </div>
                </div>
              </div>
            </Card>
          </div>
        } />

        <Route path="/graphs" element={<GraphSet />} />
      </Routes>
      <div style={{ padding: 20 }}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : sensorData ? (
          <div>
            <Co2DataCard selectedDevice={selectedDevice} selectedOutdoorDevice={selectedOutdoorDevice} selectedGuideline={selectedGuideline}/>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
      <div>
        
      </div>
    </Router>
  );
}

export default App;

/*
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Card from "@mui/material/Card";
import { Grid, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import './globals.css';
import Co2DataCard from './components/co2data';
import GraphSet from './graphs/page'; 
import Info from './info';
import ScatterPlot from './components/scatter';


async function fetchPythonBackendData(imei) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/data?imei=${imei}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch data: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching data from Python backend:", err);
    throw err;
  }
}

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [co2Data, setCo2Data] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState('4C11AE131B88');


  const handleDeviceChange = (event) => {
    setSelectedDevice(event.target.value);
  };

  
  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData(selectedDevice);
        setSensorData(data);
        setCo2Data(data.co2_prev_day);
        console.log("sensor data", data);
        console.log("co2 data", data.co2_prev_day);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getData();
    const interval = setInterval(getData, 300000); 
    return () => clearInterval(interval);
  }, [selectedDevice]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app-container">
            <div style={{ padding: 20 }}>
              <Info />
              </div>
              <div style={{ padding: 20 }}>
              <Card>
                <div style={{ padding: 20 }}>
              <FormControl variant="outlined" style={{ marginTop: 20, minWidth: 200 }}>
                <InputLabel id="device-select-label">Select Indoor Device</InputLabel>
                <Select
                  labelId="device-select-label"
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  label="Select Device"
                >
                  <MenuItem value="4C11AE131B88">Ground Floor (4C11AE131B88)</MenuItem>
                  <MenuItem value="18FE34E3DFC1">First Floor (18FE34E3DFC1)</MenuItem>
                  
                </Select>
              </FormControl>
              </div>
              <div style={{ padding: 20 }}>
              {/*<FormControl variant="outlined" style={{ marginTop: 20, minWidth: 200 }}>
                <InputLabel id="device-select-label">Select Outdoor Device</InputLabel>
                <Select
                  labelId="device-select-label"
                  value={selectedDevice}
                  onChange={handleDeviceChange}
                  label="Select Device"
                >
                  <MenuItem value="4C11AE131B88">Ground Floor (4C11AE131B88)</MenuItem>
                  <MenuItem value="18FE34E3DFC1">First Floor (18FE34E3DFC1)</MenuItem>
                  
                </Select>
              </FormControl>*
              </div>
              </Card>
            </div>
            <div style={{ justifyContent: 'flex-start', padding: 20 }} >
              {loading ? (
                <p></p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : sensorData ? (
                <Co2DataCard selectedDevice={selectedDevice} />
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div style={{ padding: 20 }}>
              {loading ? (
                <p></p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : sensorData ? (
                <ScatterPlot selectedDevice={selectedDevice}/>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        } />
        <Route path="/graphs" element={<GraphSet />} />
      </Routes>
    </Router>
  );
}

export default App;

/*
old code ^^


/*import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { epw2json } from './epw2json';
import Card from "@mui/material/Card";
//import { useZustandStore } from './zustandStore';
import { Grid } from "@mui/material";
import './globals.css';
import DataCard from './components/datacard';
import Co2DataCard from './components/co2data';
import GraphSet from './graphs/page'; 
import Info from './info';
import ScatterPlot from './components/scatter';

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

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [co2Data, setCo2Data] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const unit = "IP";

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData();
        setSensorData(data);
        setCo2Data(data.co2_prev_day);
        console.log("sensor data", data);
        console.log("co2 data", data.co2_prev_day);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getData(); 
    const interval = setInterval(getData, 300000);
    return () => clearInterval(interval); 
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app-container ">
            <div style={{ padding: 20 }}>
              <Info />
            </div>
            <div style={{ justifyContent: 'flex-start', padding: 20 }} className="flex justify-left">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : sensorData ? (
                <Co2DataCard sensorData={sensorData} co2Data={co2Data} />
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div style={{ padding: 20 }}>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : sensorData ? (
                <ScatterPlot  />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        } />
        <Route path="/graphs" element={<GraphSet />} />
      </Routes>
    </Router>
  );
}

export default App;

/*
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { epw2json } from './epw2json';
import Card from "@mui/material/Card";
//import { useZustandStore } from './zustandStore';
import { Grid } from "@mui/material";
import './globals.css';
import DataCard from './components/datacard';
import Co2DataCard from './components/co2data';
import GraphSet from './graphs/page'; 
import Info from './info';
import ScatterPlot from './components/scatter';

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

function App() {
  const [sensorData, setSensorData] = useState(null);
  const [co2Data, setCo2Data] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);


  const unit = "IP";

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPythonBackendData();
        setSensorData(data);
        setCo2Data(data.co2_prev_day)
        console.log("sensor data", data);
        console.log("co2 data", data.co2_prev_day)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div className="app-container bg-gray-200 p-4">
            <div style={{padding: 20}}>
            <Info/>
            </div>
            <div style={{ justifyContent: 'flex-start',  padding: 20 }} className="flex justify-left">
              {loading ? (
                <p></p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : sensorData ? (
                <Co2DataCard sensorData={sensorData} co2Data={co2Data} />
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div style={{padding:20}}>
            {loading ? (
                <p></p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : sensorData ? (
                <ScatterPlot/>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        } />
        <Route path="/graphs" element={<GraphSet />} />
      </Routes>
    </Router>
  );
}

export default App;
*/