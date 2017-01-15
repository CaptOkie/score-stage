import Vue from 'vue';
import home from './home.vue';
import 'Src/common.css';

window.addEventListener('load', function() {
    new Vue({ el : '#home', render : h => h(home) });
});