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
                        <md-button @click.native="openCreateDialog" class="md-fab" style="margin-right: 0;">
                            <md-icon>add</md-icon>
                        </md-button>
                    </md-layout>
                </md-layout>

                <md-list class="md-double-line">
                    <md-list-item v-for="score in scores" :key="score.id" :href="MUSIC_SCORES + '/' + score.id"
                            class="md-whiteframe-2dp md-margin">
                        <div class="md-list-text-container">
                            <span>{{score.title}}</span>
                            <span>{{score.groups.map(group => group.name).join(', ')}}</span>
                        </div>

                        <md-button class="md-icon-button md-list-action">
                            <md-icon>more_vert</md-icon>
                        </md-button>
                    </md-list-item>
                </md-list>
            </div>
        </md-layout>

        <co-create-score-dialog ref="createDialog"></co-create-score-dialog>
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
import coCreateScoreDialog from 'Components/co-create-score-dialog';
import { MUSIC_SCORES } from 'Common/urls';
import axios from 'axios';

export default {
    name : 'home',
    data() {
        return { MUSIC_SCORES, scores : undefined };
    },
    methods : {
        openCreateDialog() {
            this.$refs.createDialog.show();
        }
    },
    created() {
        axios.get(MUSIC_SCORES).then(res => {
            this.scores = res.data;
        }, error => {
            const msg = (error.response && error.response.data.error) || error.message;
            console.log(msg);
        });
    },
    components : {
        coLogout,
        coCreateScoreDialog
    }
}
</script>

<style>
.md-list-item.md-margin {
    margin-top: 8px;
    margin-bottom: 8px;
}
</style>