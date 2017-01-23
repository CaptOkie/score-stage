import Vue from 'vue';
import './mdCore';
import mdButtonToggle from 'vue-material/dist/components/mdButtonToggle';
import 'vue-material/dist/components/mdButtonToggle/index.css';

if (!mdButtonToggle.installed) {
    Vue.use(mdButtonToggle);
}

export default mdButtonToggle