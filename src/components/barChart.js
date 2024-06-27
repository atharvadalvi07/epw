import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Co2BarChart = ({ co2Data }) => {
  const categories = [
    { label: 'Acceptable', range: [0, 800], color: '#008080' },
    { label: 'Moderately Polluted', range: [800, 1200], color: '#FFB6C1' },
    { label: 'Poor', range: [1200, 1400], color: '#FF6347' },
    { label: 'Very Poor', range: [1400, 2000], color: '#8B0000' },
    { label: 'Severe', range: [2000, Infinity], color: '#000000' },
  ];


  const categoryCounts = categories.map(category => ({
    name: category.label,
    hours: 0,
    fill: category.color
  }));

 
  const filteredData = co2Data.filter(data => {
    const hour = new Date(data.time).getHours();
    return hour >= 8 && hour < 20;
  });

 
  filteredData.forEach(data => {
    const co2Level = data.co2conc;
    for (const category of categories) {
      if (co2Level >= category.range[0] && co2Level < category.range[1]) {
        categoryCounts.find(c => c.name === category.label).hours++;
        break;
      }
    }
  });

  return (
    <div>
      <BarChart width={700} height={300} data={categoryCounts}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: 'Air quality during office hours', angle: -90, position: 'insideBottomLeft', offset: 25 }} />
        <Tooltip />
        
        <Bar dataKey="hours" fill="#8884d8" barSize={40}/>
      </BarChart>
      
    </div>
  );
};

export default Co2BarChart;

/*import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Co2BarChart = ({ co2Data }) => {

  const categories = [
    { label: 'Acceptable', range: [0, 800], color: '#008080' },
    { label: 'Moderately Polluted', range: [800, 1200], color: '#FFB6C1' },
    { label: 'Poor', range: [1200, 1400], color: '#FF6347' },
    { label: 'Very Poor', range: [1400, 2000], color: '#8B0000' },
    { label: 'Severe', range: [2000, Infinity], color: '#000000' },
  ];

  const categoryCounts = categories.map(category => ({
    name: category.label,
    hours: 0,
    fill: category.color
  }));

  co2Data.forEach(data => {
    const co2Level = data.co2conc;
    for (const category of categories) {
      if (co2Level >= category.range[0] && co2Level < category.range[1]) {
        categoryCounts.find(c => c.name === category.label).hours++;
        break;
      }
    }
  });

  return (
    <div>
        <br></br>
        
    <BarChart width={700} height={350} data={categoryCounts} >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis label={{ value: 'Air quality in office hours', angle: -90, position: 'insideBottomLeft', offset: 25}} />
      <Tooltip />
      <Legend />
      <Bar dataKey="hours" fill="#8884d8" />
    </BarChart>
        
    </div>
  );
};

export default Co2BarChart;
*/