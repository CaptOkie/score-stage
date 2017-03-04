import Vue from 'vue';
import './mdCore';
import './mdBackdrop';
import mdSidenav from 'vue-material/dist/components/mdSidenav';
import 'vue-material/dist/components/mdSidenav/index.css';

if (!mdSidenav.installed) {
    Vue.use(mdSidenav);
}

export default mdSidenav