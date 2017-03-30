<template>
    <div id="music-score-page">
        <md-whiteframe md-elevation="2">
            <co-toolbar :co-username="coUsername"></co-toolbar>

            <md-tabs v-if="canEdit">
                <md-tab id="notes" md-label="Note">
                    <md-layout md-row>
                        <div class="md-row co-option-group md-button-toggle md-theme-default">
                            <md-button class="co-option-button" v-for="note in NOTES" :key="note.value" @click.native="setDuration(note.value)"
                                    :class="durationClasses(note.value)">
                                <img :src="note.label">
                            </md-button>
                        </div>

                        <div class="co-option-group-divider"></div>

                        <div class="md-row co-option-group md-button-toggle md-theme-default">
                            <md-button class="co-option-button" @click.native="setRest(!note.rest)" :class="restClasses">
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
                <co-music-score @co-score-loaded="onScoreLoaded" :co-can-edit="canEdit" :co-note="note"
                        style="min-height: 750px;">
                </co-music-score>
            </div>
            <div class="md-flex-15 md-flex-small-0"></div>
        </md-layout>
    </div>
</template>

<script>
import 'Proxies/mdWhiteframe';
import 'Proxies/mdLayout';
import 'Proxies/mdTabs';
import 'Proxies/mdButtonToggle';
import coToolbar from 'Components/co-toolbar';
import coMusicScore from 'Components/co-music-score';
import RESTS from 'Components/co-music-score/imgs/rests';
import { NOTES } from 'Components/co-music-score/constants';

export default {
    name : 'home',
    props : [ 'coUsername' ],
    data() {
        const note = { rest : false, duration : '4' };
        return { note, RESTS, NOTES, score : undefined };
    },
    computed : {
        restClasses() {
            return { 'md-toggle' : this.note.rest };
        },
        canEdit() {
            return (this.coUsername && this.score && this.score.isOwner && true) || false;
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
        },
        onScoreLoaded(score) {
            this.score = score;
        }
    },
    components : {
        coToolbar,
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

.co-option-group-divider {
    margin: 0 8px;
    padding: 0;
    display: block;
    border: 0;
    background-color: rgba(0,0,0,.12);
    width: 2px;
}

button.co-option-button {
    padding: 8px;
    min-width: 36px;
    width: 36px;
    min-height: 56px;
    height: 56px;
}
button.co-option-button > img {
    max-height: 40px;
    max-width: 20px;
}
</style>