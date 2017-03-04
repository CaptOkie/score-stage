import Vue from 'vue';
import './mdCore';
import mdTable from 'vue-material/dist/components/mdTable';
import 'vue-material/dist/components/mdTable/index.css';

if (!mdTable.installed) {
    Vue.use(mdTable);
}

export default mdTable