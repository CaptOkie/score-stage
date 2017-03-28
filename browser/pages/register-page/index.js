import 'Common/index.css';
import Vue from 'vue';
import registerPage from './register-page.vue';

window.addEventListener('load', function() {
    new Vue({ el : '#register-page', render : h => h(registerPage) });
});