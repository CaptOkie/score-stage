import Vue from 'vue';
import './mdCore';
import './mdBackdrop';
import mdDialog from 'vue-material/dist/components/mdDialog';
import 'vue-material/dist/components/mdDialog/index.css';

if (!mdDialog.installed) {
    Vue.use(mdDialog);
}

export default mdDialog