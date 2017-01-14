import Vue from 'vue';

import mdLayout from 'Proxies/mdLayout';
import mdCard from 'Proxies/mdCard';
import mdInputContainer from 'Proxies/mdInputContainer';
import mdButton from 'Proxies/mdButton';
import mdIcon from 'Proxies/mdIcon';

import 'Src/common.css';

window.addEventListener('load', function() {
	new Vue({ el : '#login' });
});