<template>
    <div id="music-score-page">
        <md-whiteframe md-elevation="2">
            <md-toolbar>
                <h1 class="md-title md-flex">
                    <a class="co-text-link" v-once :href="INDEX">Score Stage</a>
                </h1>
                <co-logout v-once></co-logout>
            </md-toolbar>

            <md-tabs>
                <md-tab id="notes" md-label="Note">
                    <md-layout md-row>
                        <div class="md-row co-option-group md-button-toggle md-theme-default">
                            <md-button class="co-option-button" v-for="note in NOTES" @click="setDuration(note.value)"
                                    :class="durationClasses(note.value)">
                                <img :src="note.label">
                            </md-button>
                        </div>

                        <div class="co-option-group-divider"></div>

                        <div class="md-row co-option-group md-button-toggle md-theme-default">
                            <md-button class="co-option-button" @click="setRest(!note.rest)" :class="restClasses">
                                <img :src="RESTS[note.duration]">
                            </md-button>
                        </div>
                    </md-layout>
                </md-tab>
            </md-tabs>
        </md-whiteframe>

        <md-layout md-row>
            <div class="md-flex-15 md-flex-small-0"></div>
            <div class="md-flex-70 md-flex-small-100 md-padding">
                <co-music-score :co-note="note" style="min-height: 750px;"></co-music-score>
            </div>
            <div class="md-flex-15 md-flex-small-0"></div>
        </md-layout>
    </div>
</template>

<script>
import 'Proxies/mdWhiteframe';
import 'Proxies/mdToolbar';
import 'Proxies/mdLayout';
import 'Proxies/mdTabs';
import 'Proxies/mdButtonToggle';
import { INDEX } from 'Common/urls';
import coLogout from 'Components/co-logout';
import coMusicScore from 'Components/co-music-score';
import RESTS from 'Components/co-music-score/imgs/rests';
import { NOTES } from 'Components/co-music-score/constants';

export default {
    name : 'home',
    data() {
        const note = { rest : false, duration : '4' };
        return { INDEX, note, RESTS, NOTES };
    },
    computed : {
        restClasses() {
            return { 'md-toggle' : this.note.rest };
        }
    },
    methods : {
        durationClasses(duration) {
            return { 'md-toggle' : (duration === this.note.duration) };
        },
        setDuration(duration) {
            this.note.duration = duration;
        },
        setRest(rest) {
            this.note.rest = rest;
        }
    },
    components : {
        coLogout,
        coMusicScore
    }
}
</script>

<style>
body, #music-score-page {
    width: 100%;
    min-height: 100%;
}

body {
    overflow-y: scroll;
}

.co-option-group {
    flex: initial;
}
button.co-option-button {
    min-width: initial;
    padding: 8px;
    width: 36px;
}
button.co-option-button > img {
    max-height: 40px;
    max-width: 20px;
}
.co-option-group-divider {
    margin: 0 8px;
    padding: 0;
    display: block;
    border: 0;
    background-color: rgba(0,0,0,.12);
    width: 2px;
}
</style>