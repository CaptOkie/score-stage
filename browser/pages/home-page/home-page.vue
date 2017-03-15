<template>
    <div id="home-page">
        <md-toolbar>
            <h1 class="md-title md-flex">Score Stage</h1>
            <co-logout v-once></co-logout>
        </md-toolbar>

        <md-layout md-row md-align="center">
            <div class="md-flex-small md-flex-medium-70 md-flex-50">
                <md-layout md-row style="flex-wrap: nowrap;" class="md-margin">
                    <h1 class="md-display-1 md-flex-100" style="min-width: 50%;">Music Scores</h1>

                    <md-layout md-column md-align="center">
                        <md-button v-once :href="MUSIC_SCORES" class="md-fab" style="margin-right: 0;">
                            <md-icon>add</md-icon>
                        </md-button>
                    </md-layout>
                </md-layout>

                <md-list class="md-double-line">
                    <md-list-item v-for="score in scores" :key="score" class="md-whiteframe-2dp md-margin">
                        <div class="md-list-text-container">
                            <span>Title</span>
                            <span>Some extra info</span>
                        </div>

                        <md-icon class="md-size-2x">account_circle</md-icon>
                    </md-list-item>
                </md-list>
            </div>
        </md-layout>
    </div>
</template>

<script>
import 'Proxies/mdToolbar';
import 'Proxies/mdLayout';
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import 'Proxies/mdList';
import 'Proxies/mdWhiteframe';
import coLogout from 'Components/co-logout';
import { MUSIC_SCORES } from 'Common/urls';

export default {
    name : 'home',
    data() {
        return { MUSIC_SCORES, scores : [ 1, 2, 3, 4, 5 ] };
    },
    components : {
        coLogout
    }
}
</script>

<style>
.md-list-item.md-margin {
    margin-top: 8px;
    margin-bottom: 8px;
}
</style>