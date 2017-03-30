import 'Common/index.css';
import Vue from 'vue';
import musicScorePage from './music-score-page.vue';

window.addEventListener('load', function() {
    new Vue({ el : '#music-score-page', components : { musicScorePage } });
});