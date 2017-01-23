import Vue from 'vue';
import './mdCore';
import './mdImage';
import mdIcon from 'vue-material/dist/components/mdIcon';
import 'vue-material/dist/components/mdIcon/index.css';

if (!mdIcon.installed) {
    Vue.use(mdIcon);
}

export default mdIcon