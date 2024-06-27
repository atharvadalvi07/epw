import React from 'react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, Text } from 'recharts';
import { Card } from '@mui/material';

const RadialBarChartComponent = ({ value , color, pollutant}) => {

  const data = [
    { name: '', value: 100, fill: '#ffffff'},
    { name: 'Value', value: value, fill: color },
    
  ];

  return (

    <div style={{ position: 'relative', width: '100%', height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={15}
          startAngle={180}
          endAngle={0}
          data={data}
          
        >
          <RadialBar
            minAngle={15}
            background
            clockWise
            dataKey="value"
          />
        
        
        
        </RadialBarChart>
      </ResponsiveContainer>

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        fontSize: '28px',
        fontWeight: 'bold'
      }}>
        {value} 
        <div style={{ fontSize: '16px', fontWeight: 'normal' }}>{pollutant} index</div>
      </div>
    </div>
    
  );
};

export default RadialBarChartComponent;
