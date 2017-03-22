<template>
    <md-toolbar>
        <h1 class="md-title md-flex">
            <a class="co-text-link" v-once :href="indexUrl">Score Stage</a>
        </h1>
        <co-logout v-once></co-logout>
    </md-toolbar>
</template>

<script>
import 'Proxies/mdToolbar';
import coLogout from 'Components/co-logout';
import { index } from 'Common/urls';

export default {
    name : 'co-toolbar',
    data() {
        return { indexUrl : index() };
    },
    components : {
        coLogout
    }
}
</script>