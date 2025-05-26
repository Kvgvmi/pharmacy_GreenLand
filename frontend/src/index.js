import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import WebFont from 'webfontloader';
import 'process/browser';
import { Buffer } from 'buffer';

window.Buffer = Buffer;


WebFont.load({
   google: {
     families: ['Titillium Web:300,400,700', 'Outfit:100,200,300,400,500,600,700,800,900' , 'Open Sans:300,400' ,'sans-serif']
   }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
