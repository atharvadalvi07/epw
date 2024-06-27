const getColor = (value, paramName) => {
    const colorRanges = {
      pm25: [
        { range: [0, 15], color: "#00FF00" },
        { range: [15.01, 30], color: "#FFA500" },
        { range: [30.01, 50], color: "#FF5733" },
        { range: [50.01, 100], color: "#FF5733" },
        { range: [100.01, Infinity], color: "#FF6347" },
        // { range: [250.01, Infinity], color: "#7F1D1D" }
      ],
      co2: [
        {range: [0, 800], color:"#00FF00"},
        // {range: [200.01, 400], color:"#7FFF00"},
        {range: [800.01, 1000], color:"#FFA500"},
        // {range: [600.01,800], color:"#FF8C00"},
        {range: [800.01,1000], color:"#FF6347"},
        {range: [1000.01, Infinity], color:"#FF0000"},

      ],

      pm1: [
        { range: [0, 30], color: "#FEE2E2" },
        { range: [30.01, 60], color: "#FECACA" },
        { range: [60.01, 90], color: "#FCA5A5" },
        { range: [90.01, 120], color: "#F87171" },
        { range: [120.01, 250], color: "#EF4444" },
        { range: [250.01, Infinity], color: "#BA0909" },
      ],
      pm10: [
        { range: [0, 50], color: "#FEE2E2" },
        { range: [50.01, 100], color: "#FECACA" },
        { range: [100.01, 250], color: "#FCA5A5" },
        { range: [250.01, 350], color: "#F87171" },
        { range: [350.01, 430], color: "#EF4444" },
        { range: [430.01, Infinity], color: "#DC2626" },
      ],
      no2: [
        { range: [0, 50], color: "#FEE2E2" },
        { range: [50.01, 100], color: "#FECACA" },
        { range: [100.01, 250], color: "#FCA5A5" },
        { range: [250.01, 350], color: "#F87171" },
        { range: [350.01, 430], color: "#EF4444" },
        { range: [430.01, Infinity], color: "#DC2626" },
      ],
      o3: [
        { range: [0, 50], color: "#FEE2E2" },
        { range: [50.01, 100], color: "#FECACA" },
        { range: [100.01, 250], color: "#FCA5A5" },
        { range: [250.01, 350], color: "#F87171" },
        { range: [350.01, 430], color: "#EF4444" },
        { range: [430.01, Infinity], color: "#DC2626" },
      ],
      co: [
        { range: [0, 50], color: "#FEE2E2" },
        { range: [50.01, 100], color: "#FECACA" },
        { range: [100.01, 250], color: "#FCA5A5" },
        { range: [250.01, 350], color: "#F87171" },
        { range: [350.01, 430], color: "#EF4444" },
        { range: [430.01, Infinity], color: "#DC2626" },
      ],
      so2: [
        { range: [0, 50], color: "#FEE2E2" },
        { range: [50.01, 100], color: "#FECACA" },
        { range: [100.01, 250], color: "#FCA5A5" },
        { range: [250.01, 350], color: "#F87171" },
        { range: [350.01, 430], color: "#EF4444" },
        { range: [430.01, Infinity], color: "#DC2626" },
      ],
      temp: [
        { range: [0, 23], color: "#04D9FF" },
        { range: [23.01, 27], color: "#00FF00" },
        { range: [27.01, 28], color: "#FF6347" },
        { range: [28.01, Infinity], color: "#FF0000" },
        // { range: [45.01, 70], color: "#1DA267" },
        // { range: [70.01, Infinity], color: "#0F6B3F" }
    ],
      humidity: [
        { range: [0, 30], color: "#04D9FF" },
        { range: [30.01, 50], color: "#00FF00" },
        { range: [50.01, 70], color: "#FFA500" },
        { range: [70.01, 100], color: "#FF0000"},
        // { range: [60.01, 80], color: "#4788D6" },
        // { range: [80.01, Infinity], color: "#2563EB" }
    ],    
      tvoc: [
        {range: [0, 100], color:'#00FF00'},
        {range: [100.1, 250], color:'#FF6347' },
        {range: [250.1, Infinity], color:'#FF0000'}
    ],
      iew: [
        {range: [0,70], color:'#EF3340'},
        {range: [70.1, 80], color:'#FF8200'},
        {range: [80.1, 90], color:'#FFA500'},
        {range: [90.1, 100], color:'#00FF00'}
      ],
    };
      
  
    if (value === null) {
      return "black";
    }
  
    const ranges = colorRanges[paramName];
    if (!ranges) {
      return "black";
    }
  
    for (const range of ranges) {
      const [min, max] = range.range;
      if (value >= min && value <= max) {
        return range.color;
      }
    }
  
    return "black"; // Default color
  };
  
  export default getColor;
  