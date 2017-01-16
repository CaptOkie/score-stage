import Vue from 'vue';
import homePage from './home-page.vue';
import 'Common/index.css';

window.addEventListener('load', function() {
    new Vue({ el : '#home-page', render : h => h(homePage) });
});