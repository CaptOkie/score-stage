import Vue from 'vue';
import './mdCore';
import mdSpinner from 'vue-material/dist/components/mdSpinner';
import 'vue-material/dist/components/mdSpinner/index.css';

if (!mdSpinner.installed) {
    Vue.use(mdSpinner);
}

export default mdSpinner