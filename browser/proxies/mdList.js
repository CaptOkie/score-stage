import Vue from 'vue';
import './mdCore';
import mdList from 'vue-material/dist/components/mdList';
import 'vue-material/dist/components/mdList/index.css';

if (!mdList.installed) {
    Vue.use(mdList);
}

export default mdList