// src/Router.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import App from './App'; // Adjust the path as necessary
import GraphSet from './graphs/page'; // Adjust the path as necessary

const AppRouter = () => (
  <Router>
    <Routes>
      <Route exact path="/" component={App} />
      <Route path="/graphs" component={GraphSet} />
    </Routes>
  </Router>
);

export default AppRouter;
