import Vue from 'vue';
import coHome from './home.vue';
import 'Src/common.css';

window.addEventListener('load', function() {
    new Vue({ el : 'co-home', components : { coHome } });
});