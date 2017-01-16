<template>
    <div id="music-score-page">
        <md-toolbar>
            <h1 class="md-title md-flex">Score Stage</h1>
            <co-logout v-once></co-logout>
        </md-toolbar>

        <md-layout md-row>
            <div class="md-flex-15 md-flex-small-0"></div>
            <div class="md-flex-70 md-flex-small md-padding">
                <co-music-score></co-music-score>
            </div>
            <div class="md-flex-15 md-flex-small-0"></div>
        </md-layout>
    </div>
</template>

<script>
import 'Proxies/mdToolbar';
import 'Proxies/mdLayout';
import coLogout from 'Components/co-logout';
import coMusicScore from 'Components/co-music-score';

export default {
    name : 'home',
    components : {
        coLogout,
        coMusicScore
    }
}
</script>

<style>
body, #music-score-page {
    height: 100%;
    width: 100%;
}

body {
    overflow-y: scroll;
}
</style>