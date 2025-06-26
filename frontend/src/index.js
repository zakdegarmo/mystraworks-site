import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot for React 18+
import IDELayout from './components/IDELayout'; // Import your layout component
// import './index.css'; // Uncomment if you have a global CSS file

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // Create a root

root.render(
  <React.StrictMode>
    <IDELayout /> {/* Render your main layout component */}
  </React.StrictMode>
);