import 'Common/index.css';
import Vue from 'vue';
import homePage from './home-page.vue';

window.addEventListener('load', function() {
    new Vue({ el : '#home-page', render : h => h(homePage) });
});