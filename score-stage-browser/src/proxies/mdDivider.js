import Vue from 'vue';
import './mdCore';
import mdDivider from 'vue-material/dist/components/mdDivider';
import 'vue-material/dist/components/mdDivider/index.css';

if (!mdDivider.installed) {
    Vue.use(mdDivider);
}

export default mdDivider