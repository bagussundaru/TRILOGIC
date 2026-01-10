import React from 'react';
import ReactDOM from 'react-dom/client';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Import Gridstack styles
import 'gridstack/dist/gridstack.min.css';

import './index.css';
import './styles/animations.css';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
