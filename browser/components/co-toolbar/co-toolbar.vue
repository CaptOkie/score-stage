<template>
    <md-toolbar v-once>
        <h1 class="md-title md-flex">
            <a class="co-text-link" :href="indexUrl">Score Stage</a>
        </h1>
        <form :action="searchUrl" method="get">
            <input type="text" name="query" class="co-search-input md-whiteframe-2dp" placeholder="Search">
        </form>
        <co-logout v-if="coUsername"></co-logout>
        <md-button v-else :href="loginUrl">Login</md-button>
    </md-toolbar>
</template>

<script>
import 'Proxies/mdToolbar';
import 'Proxies/mdButton';
import 'Proxies/mdWhiteframe';
import coLogout from 'Components/co-logout';
import { index, login, search } from 'Common/urls';

export default {
    name : 'co-toolbar',
    props : [ 'coUsername' ],
    data() {
        return { indexUrl : index(), loginUrl : login(), searchUrl : search() };
    },
    components : {
        coLogout
    }
}
</script>