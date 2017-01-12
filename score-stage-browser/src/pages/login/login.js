import '../../common.css'
import Vue from 'vue'

import mdCore from 'vue-material/dist/components/mdCore/index.js'
import 'vue-material/dist/components/mdCore/index.css'

import mdLayout from 'vue-material/dist/components/mdLayout/index.js'
import 'vue-material/dist/components/mdLayout/index.css'

import mdCard from 'vue-material/dist/components/mdCard/index.js'
import 'vue-material/dist/components/mdCard/index.css'

import mdInputContainer from 'vue-material/dist/components/mdInputContainer/index.js'
import 'vue-material/dist/components/mdInputContainer/index.css'

import mdButton from 'vue-material/dist/components/mdButton/index.js'
import 'vue-material/dist/components/mdButton/index.css'

import mdIcon from 'vue-material/dist/components/mdIcon/index.js'
import 'vue-material/dist/components/mdIcon/index.css'

window.addEventListener('load', function() {
	Vue.use(mdCore);
	Vue.use(mdLayout);
	Vue.use(mdCard);
	Vue.use(mdInputContainer);
	Vue.use(mdButton);
	Vue.use(mdIcon);

	new Vue({
		el : '#login'
	});
});