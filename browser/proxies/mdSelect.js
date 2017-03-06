import Vue from 'vue';
import './mdCore';
import mdSelect from 'vue-material/dist/components/mdSelect';
import 'vue-material/dist/components/mdSelect/index.css';

if (!mdSelect.installed) {
    Vue.use(mdSelect);
}

export default mdSelect