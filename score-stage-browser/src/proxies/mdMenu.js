import Vue from 'vue';
import './mdCore';
import './mdList';
import './mdBackdrop';
import mdMenu from 'vue-material/dist/components/mdMenu';
import 'vue-material/dist/components/mdMenu/index.css';

if (!mdMenu.installed) {
    Vue.use(mdMenu);
}

export default mdMenu