import 'Common/index.css';
import Vue from 'vue';

import mdLayout from 'Proxies/mdLayout';
import mdCard from 'Proxies/mdCard';
import mdInputContainer from 'Proxies/mdInputContainer';
import mdButton from 'Proxies/mdButton';
import mdIcon from 'Proxies/mdIcon';

window.addEventListener('load', function() {
    new Vue({ el : '#login-page' });
});