import Vue from 'vue';
import './mdCore';
import mdToolbar from 'vue-material/dist/components/mdToolbar';
import 'vue-material/dist/components/mdToolbar/index.css';

if (!mdToolbar.installed) {
    Vue.use(mdToolbar);
}

export default mdToolbar