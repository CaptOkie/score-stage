import 'Common/index.css';
import Vue from 'vue';

import 'Proxies/mdLayout';
import 'Proxies/mdCard';
import 'Proxies/mdInputContainer';
import 'Proxies/mdButton';
import 'Proxies/mdIcon';

window.addEventListener('load', function() {
    new Vue({ el : '#login-page' });
});