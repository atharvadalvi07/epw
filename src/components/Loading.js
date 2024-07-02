import React from 'react';
import './loading.css'; 

function LoadingJS() {
  return (
    <div className="loading-container">
      <h1></h1>
      <div className="logo">
        <div className="circle">
          <div className="circle">
            <div className="circle"></div>
          </div>
        </div>
        <div className="hold-x">
          <div className="respirer  "></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingJS;
