import Vue from 'vue'
import login from './login.vue'

window.addEventListener('load', function() {
	new Vue({
		el : '#login',
		render : h => h(login)
	});
});