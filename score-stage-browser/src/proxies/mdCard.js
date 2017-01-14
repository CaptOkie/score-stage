import Vue from 'vue';
import './mdCore';
import mdCard from 'vue-material/dist/components/mdCard';
import 'vue-material/dist/components/mdCard/index.css';

if (!mdCard.installed) {
    Vue.use(mdCard);
}

export default mdCard