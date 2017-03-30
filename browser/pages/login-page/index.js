import 'Common/index.css';
import Vue from 'vue';
import loginPage from './login-page.vue';

window.addEventListener('load', function() {
    new Vue({ el : '#login-page', render : h => h(loginPage) });
});