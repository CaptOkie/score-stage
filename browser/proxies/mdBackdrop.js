import Vue from 'vue';
import './mdCore';
import mdBackdrop from 'vue-material/dist/components/mdBackdrop';
import 'vue-material/dist/components/mdBackdrop/index.css';

if (!mdBackdrop.installed) {
    Vue.use(mdBackdrop);
}

export default mdBackdrop