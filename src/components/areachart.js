import { Card } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import getColor from './colorscale';
import React, { PureComponent, useState, useEffect } from 'react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Scatter, ReferenceArea, Area, AreaChart
} from 'recharts';
import './index.css';

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

export default class co2Chart extends PureComponent {
    //const [data, setData] = useState([]);
    render() {
    return(
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart  >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time"/>
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="co2" stroke="#8884d8" fill="#8884d8" />
          </AreaChart>
      </ResponsiveContainer>
    )
}

}

