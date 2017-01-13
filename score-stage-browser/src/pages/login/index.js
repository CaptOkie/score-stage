import Vue from 'vue';

import mdLayout from '../../proxies/mdLayout';
import mdCard from '../../proxies/mdCard';
import mdInputContainer from '../../proxies/mdInputContainer';
import mdButton from '../../proxies/mdButton';
import mdIcon from '../../proxies/mdIcon';

import '../../common.css';

window.addEventListener('load', function() {
	new Vue({ el : '#login' });
});