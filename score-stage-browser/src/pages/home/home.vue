<template>
    <div id="home">
        <div class="home-content">
            <md-toolbar>
                <md-button class="md-icon-button" @click.native="$refs.sidenav.open">
                    <md-icon>menu</md-icon>
                </md-button>
                <h2 class="md-title">Home</h2>
            </md-toolbar>

            <md-layout md-row>
                <md-layout md-flex="15" md-hide-small md-hide-xsmall></md-layout>
                <md-layout md-flex="70" md-flex-small="100" md-flex-xsmall="100" class="md-padding">
                    <co-music-score></co-music-score>
                </md-layout>
                <md-layout md-flex="15" md-hide-small md-hide-xsmall></md-layout>
            </md-layout>
        </div>

        <co-sidenav ref="sidenav" :co-context-path="coContextPath"></co-sidenav>
    </div>
</template>

<script>
import 'Proxies/mdToolbar';
import 'Proxies/mdLayout';
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import coMusicScore from 'Components/co-music-score';
import coSidenav from 'Components/co-sidenav';

export default {
    name : 'home',
    props : [ 'coContextPath' ],
    components : {
        coMusicScore,
        coSidenav
    }
}
</script>

<style>
.home-content {
    overflow-y: scroll;
    height: 100%;
}

body, #home {
    overflow: hidden;
    height: 100%;
    width: 100%;
}
</style>