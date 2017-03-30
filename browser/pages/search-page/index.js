import 'Common/index.css';
import Vue from 'vue';
import searchPage from './search-page.vue';

window.addEventListener('load', function() {
    new Vue({ el : '#search-page', components : { searchPage } });
});