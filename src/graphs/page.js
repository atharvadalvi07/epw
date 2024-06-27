import React, { useState, useEffect } from 'react';
import { Visualization } from './tempVsTime';
import { WindRoseChart } from './epwWindRose';
import { CloudFloodPlot } from './cloudFloodPlot';
import { TempFloodPlot } from './tempFloodPlot';
import PsychrometricChart from './psychrometricChart'; 
import { epw2json } from './epw2json';
import { Grid } from "@mui/material";
import Card from "@mui/material/Card";
import Header from './header';
import { VisualizationDaily } from './dailyTemp';
import * as d3 from 'd3';

async function fetchEpwFile() {
  try {
    const res = await fetch('/IND_MH_Pune.AP.430630_ISHRAE2014.epw');
    if (!res.ok) {
      throw new Error(`Failed to fetch EPW file: ${res.statusText}`);
    }
    return res.text();
  } catch (err) {
    console.error("Error fetching EPW file:", err);
    throw err;
  }
}

async function fetchCSVFile() {
  try {
    const res = await fetch('/dailyTemp.csv');
    if (!res.ok) {
      throw new Error(`Failed to fetch CSV file: ${res.statusText}`);
    }
    const text = await res.text();
    return d3.csvParse(text, d => ({
      month: +d.month,
      day: +d.day,
      avg: +d['Dry Bulb Temp(avg)'],
      low: +d['Dry Bulb Temp(low)'],
      high: +d['Dry Bulb Temp(high)']
    }));
  } catch (err) {
    console.error("Error fetching CSV file:", err);
    throw err;
  }
}

function GraphSet() {
  const [epwData, setEpwData] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const unit = "IP";

  useEffect(() => {
    async function getFileContent() {
      try {
        const content = await fetchEpwFile();
        const parsedData = epw2json(content);
        setEpwData(parsedData);
        console.log("parse", parsedData);
      } catch (err) {
        console.error("Error parsing EPW file:", err);
      }
    }
    getFileContent();
  }, []);

  useEffect(() => {
    async function getCSVContent() {
      try {
        const parsedCSV = await fetchCSVFile();
        setCsvData(parsedCSV);
        console.log("CSV Data:", parsedCSV);
      } catch (err) {
        console.error("Error parsing CSV file:", err);
      }
    }
    getCSVContent();
  }, []);

  return (
    <div className="w-3/4">
      <Header />
      <div id="Graph" className="App" style={{padding: 20}}>
        <Visualization data={epwData} />
        {csvData ? <VisualizationDaily data={csvData} /> : <p>Loading CSV Data...</p>}
        <TempFloodPlot epw={epwData} unitSystem={unit} />
        <WindRoseChart epw={epwData} unitSystem={unit} />
        <CloudFloodPlot epw={epwData} />
      </div>
    </div>
  );
}

export default GraphSet;

/*
import React, { useState, useEffect } from 'react';
import { Visualization } from './tempVsTime';
import { WindRoseChart } from './epwWindRose';
import { CloudFloodPlot } from './cloudFloodPlot';
import { TempFloodPlot } from './tempFloodPlot';
import PsychrometricChart from './psychrometricChart'; 
import { epw2json } from './epw2json';
import { Grid } from "@mui/material";
import Card from "@mui/material/Card";
import Header from './header';
import { VisualizationDaily } from './dailyTemp';

async function fetchEpwFile() {
  try {
    const res = await fetch('/IND_MH_Pune.AP.430630_ISHRAE2014.epw');
    if (!res.ok) {
      throw new Error(`Failed to fetch EPW file: ${res.statusText}`);
    }
    return res.text();
  } catch (err) {
    console.error("Error fetching EPW file:", err);
    throw err;
  }
}

function GraphSet() {
  const [epwData, setEpwData] = useState(null);
  const unit = "IP";

  useEffect(() => {
    async function getFileContent() {
      try {
        const content = await fetchEpwFile();
        const parsedData = epw2json(content);
        setEpwData(parsedData);
        console.log("parse", parsedData)
      } catch (err) {
        console.error("Error parsing EPW file:", err);
      }
    }
    getFileContent();
  }, []);

  return (
    <div className="w-3/4">
      <Header/>
      <div id="Graph" className="App">
        <Visualization data={epwData} />
        <VisualizationDaily data={epwData}/>
        <TempFloodPlot epw={epwData} unitSystem={unit} />
        <WindRoseChart epw={epwData} unitSystem={unit} />
        <CloudFloodPlot epw={epwData} />
        <PsychrometricChart/>
      </div>
    </div>
  );
}

export default GraphSet;


import React, { useState, useEffect } from 'react';
import FileUploader from './FileUploader';
import { Visualization } from './tempVsTime';
import { WindRoseChart } from './epwWindRose';
import { CloudFloodPlot } from './cloudFloodPlot';
import { TempFloodPlot } from './tempFloodPlot';
import PsychrometricChart from './psychrometricChart'; 
import { epw2json } from './epw2json';
import { Grid } from "@mui/material";
//import './globals.css';

function GraphSet() {
  const [epwData, setEpwData] = useState(null);

  const handleFileUpload = (content) => {
    const parsedData = epw2json(content);
    setEpwData(parsedData);
  };

  const unit = "IP";

  return (
    <div className="w-3/4">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <h4 className="text-black text-2xl {`${inter.variable} font-sans`} font-semibold">
              EPW File Visualizer
            </h4>
            <h5 className="text-black text-xl {`${inter.variable} font-sans`} font-semibold">
              Upload your EPW file
            </h5>
            <FileUploader onFileUpload={handleFileUpload} />
          </Grid>
          
        </Grid>
      <div id="Graph" className="App">
        <Visualization data={epwData} />
        <TempFloodPlot epw={epwData} unitSystem={unit} />
        <WindRoseChart epw={epwData} unitSystem={unit} />
        <CloudFloodPlot epw={epwData} />
        <PsychrometricChart data={epwData} />
      </div>
    </div>
  );
}

export default GraphSet;

/*
<div className="w-3/4">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <h4 className="text-black text-2xl {`${inter.variable} font-sans`} font-semibold">
              EPW File Visualizer
            </h4>
            <h5 className="text-black text-xl {`${inter.variable} font-sans`} font-semibold">
              Upload your EPW file
            </h5>
            <FileUploader onFileUpload={handleFileUpload} />
          </Grid>
          
        </Grid>
      </div>
      <div id="Graph" className="App">
        <Visualization data={epwData} />
        <TempFloodPlot epw={epwData} unitSystem={unit} />
        <WindRoseChart epw={epwData} unitSystem={unit} />
        <CloudFloodPlot epw={epwData} />
        <PsychrometricChart data={epwData} />
      </div>
*/