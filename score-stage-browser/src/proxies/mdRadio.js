import Vue from 'vue';
import './mdCore';
import mdRadio from 'vue-material/dist/components/mdRadio';
import 'vue-material/dist/components/mdRadio/index.css';

if (!mdRadio.installed) {
    Vue.use(mdRadio);
}

export default mdRadio