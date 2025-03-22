import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Auth0Provider } from '@auth0/auth0-react'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Wrap your app with StrictMode to enable additional error checking in development.

  <Auth0Provider
    domain="dev-ty5c4ajwu51u51se.us.auth0.com"
    clientId="UBvdkkeelAZoaA0Ow7hhKt6tBtGRW9tt"
    redirectUri={window.location.origin + "/callback"}
    audience="https://dalnotes-api"
    scope="read:current_user"
  >
    <React.StrictMode>
    <App />
    </React.StrictMode>
  </Auth0Provider>
  
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
