import Vue from 'vue';
import home from './home.vue';
import 'Common/index.css';

window.addEventListener('load', function() {
    new Vue({ el : '#home', render : h => h(home) });
});