import '../../common.css'
import Vue from 'vue'
import mdCore from 'vue-material/dist/components/mdCore/index.js'
import 'vue-material/dist/components/mdCore/index.css'

window.addEventListener('load', function() {
	Vue.use(mdCore);

	new Vue({
		el : '#login'
	});
});