import Vue from 'vue';
import './mdCore';
import mdLayout from 'vue-material/dist/components/mdLayout';
import 'vue-material/dist/components/mdLayout/index.css';

if (!mdLayout.installed) {
    Vue.use(mdLayout);
}

export default mdLayout