import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Import Gridstack styles
import 'gridstack/dist/gridstack.min.css';

import './index.css';
import './styles/animations.css';
import App from './App.jsx';

const app = createApp(App);

// Configure PrimeVue with Aura theme
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            prefix: 'p',
            darkModeSelector: '.dark-mode',
            cssLayer: false
        }
    }
});

// Register services
app.use(ToastService);
app.use(ConfirmationService);

// Register directives
app.directive('tooltip', Tooltip);

app.mount('#app');
