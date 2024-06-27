import React from 'react';
import { Sector, Cell, PieChart, Pie, Tooltip, Text, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ value , sensorData}) => {
    const width = 300; 
    const chartValue = value; 

    const colorData = [
        { range: [0, 70], value: 70, color: '#EF3340', label: 'Severe' },
        { range: [70.1, 80], value: 9.9, color: '#FF8200', label: 'Bad' },
        { range: [80.1, 90], value: 9.9, color: '#FFA500', label: 'Moderate' },
        { range: [90.1, 100], value: 9.9, color: '#00FF00', label: 'Good' }
    ];

    const activeSectorIndex = colorData.findIndex(sector => {
        return chartValue >= sector.range[0] && chartValue <= sector.range[1];
    });

    const sumValues = colorData.reduce((acc, cur) => acc + cur.value, 0);

    const arrowData = [
        { value: chartValue },
        { value: 1 }, 
        { value: sumValues - chartValue - 1 }
    ];

    const pieProps = {
        startAngle: 0,
        endAngle: 360,
        cx: '50%',
        cy: '50%'
    };

    const pieRadius = {
        innerRadius: '70%',
        outerRadius: '90%'
    };

    const Arrow = ({ cx, cy, midAngle, outerRadius }) => { //eslint-disable-line react/no-multi-comp
        const RADIAN = Math.PI / 180;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const mx = cx + (outerRadius + width * 0.01) * cos;
        const my = cy + (outerRadius + width * 0.01) * sin;
        return (
            <g>
                
                <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="6" stroke="#666" fill="none" strokeLinecap="round"/>
                <circle cx={cx} cy={cy} r={width * 0.2} fill="#ffffff" stroke="black"/>
            </g>
        );
    };

    // const Arrow = ({ cx, cy, midAngle, outerRadius }) => {
    //     const RADIAN = Math.PI / 180;
    //     const sin = Math.sin(-RADIAN * midAngle);
    //     const cos = Math.cos(-RADIAN * midAngle);
    //     const mx = cx + (outerRadius * 0.7) * cos; 
    //     const my = cy + (outerRadius * 0.7) * sin; 
    //     return (
    //         <g>
    //             <path d={`M${cx},${cy}L${mx},${my}`} strokeWidth="6" stroke="#666" fill="none" strokeLinecap="round" />
    //         </g>
    //     );
    // };

    const ActiveSectorMark = ({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill }) => {
        return (
            <g>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius * 1.1}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    const getLabel = (value) => {
        if (value <= 70) {
            return 'Severe';
        } else if (value <= 80) {
            return 'Bad';
        } else if (value <= 90) {
            return 'Moderate';
        } else {
            return 'Good';
        }
    };

    const label = getLabel(chartValue);

    return (
        <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
            <br/>
        <ResponsiveContainer width="100%" height={250}>
            <PieChart width={width} height={width}>
            {/* <Tooltip formatter={(value) => `Value: ${value}`} /> */}
                <Pie
                    activeIndex={activeSectorIndex}
                    activeShape={ActiveSectorMark}
                    data={colorData}
                    dataKey="value"
                    nameKey="label"
                    fill="#8884d8"
                    {...pieRadius}
                    {...pieProps}
                >
                    {colorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Pie
                    stroke="none"
                    data={arrowData}
                    dataKey="value"
                    outerRadius={pieRadius.innerRadius}
                    fill="none"
                    {...pieProps}
                    activeIndex={1}
                    activeShape={Arrow}
                />
                
            </PieChart>
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-47.5%, -30%)',
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
            }}>
                <div>IEW Index</div>
                <div style={{ fontSize: '24px' }}>{chartValue}</div>
                <div>{label}</div>
            </div>
            {/* {colorData.map((entry, index) => (
                <div key={`label-${index}`} style={{
                    position: 'absolute',
                    top: `${50 - 40 * Math.cos(2 * Math.PI * (entry.range[0] + entry.value / 2) / 100)}%`,
                    left: `${50 + 40 * Math.sin(2 * Math.PI * (entry.range[0] + entry.value / 2) / 100)}%`,
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold'
                }}>
                    {entry.label}
                </div>
            ))} */}
            
        </ResponsiveContainer>
        
        </div>
    );
};

export default GaugeChart;
