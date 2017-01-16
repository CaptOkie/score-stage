import Vue from 'vue';
import musicScorePage from './music-score-page.vue';
import 'Common/index.css';

window.addEventListener('load', function() {
    new Vue({ el : '#music-score-page', render : h => h(musicScorePage) });
});