import Vue from 'vue';
import mdCore from 'vue-material/dist/components/mdCore';
import 'vue-material/dist/components/mdCore/index.css';

if (!mdCore.installed) {
    Vue.use(mdCore);
}

export default mdCore