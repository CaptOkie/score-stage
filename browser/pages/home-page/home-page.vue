<template>
    <div id="home-page">
        <co-toolbar></co-toolbar>

        <md-layout md-row md-align="center">
            <div class="md-flex-small md-flex-medium-70 md-flex-50">
                <md-layout md-row style="flex-wrap: nowrap;" class="md-margin">
                    <h1 class="md-display-1 md-flex-100" style="min-width: 50%;">Music Scores</h1>

                    <md-layout md-column md-align="center">
                        <md-button @click.native="openCreateDialog" class="md-fab" style="margin-right: 0;">
                            <md-icon>add</md-icon>
                        </md-button>
                    </md-layout>
                </md-layout>

                <md-list class="md-double-line">
                    <md-list-item v-for="(score, index) in scores" :key="score.id" :href="scoreUrl(score)"
                            class="md-whiteframe-2dp md-margin">
                        <div class="md-list-text-container">
                            <span>{{score.title}}</span>
                            <span>{{score.groups.map(group => group.name).join(', ')}}</span>
                        </div>

                        <md-button @click.native.stop.prevent="deleteScore(score, index)" class="md-icon-button md-list-action">
                            <md-icon>delete</md-icon>
                        </md-button>
                    </md-list-item>
                </md-list>
            </div>
        </md-layout>

        <co-create-score-dialog ref="createDialog"></co-create-score-dialog>
        <co-delete-score-dialog ref="deleteDialog"></co-delete-score-dialog>
    </div>
</template>

<script>
import 'Proxies/mdLayout';
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import 'Proxies/mdList';
import 'Proxies/mdWhiteframe';
import coToolbar from 'Components/co-toolbar';
import coCreateScoreDialog from 'Components/co-create-score-dialog';
import coDeleteScoreDialog from 'Components/co-delete-score-dialog';
import { musicScores } from 'Common/urls';
import axios from 'axios';

export default {
    name : 'home',
    data() {
        return { scores : undefined };
    },
    methods : {
        openCreateDialog() {
            this.$refs.createDialog.show();
        },
        deleteScore(score, index) {
            this.$refs.deleteDialog.show(score, () => {
                axios.delete(this.scoreUrl(score)).then(res => {
                    this.scores.splice(index, 1);
                }, error => {
                    const msg = (error.response && error.response.data.error) || error.message;
                    console.log(msg);
                });
            });
        },
        scoreUrl(score) {
            return musicScores(score.id);
        }
    },
    created() {
        axios.get(musicScores()).then(res => {
            this.scores = res.data;
        }, error => {
            const msg = (error.response && error.response.data.error) || error.message;
            console.log(msg);
        });
    },
    components : {
        coToolbar,
        coCreateScoreDialog,
        coDeleteScoreDialog
    }
}
</script>

<style>
.md-list-item.md-margin {
    margin-top: 8px;
    margin-bottom: 8px;
}
</style>