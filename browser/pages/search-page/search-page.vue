<template>
    <div id="search-page">
        <co-toolbar :co-username="coUsername"></co-toolbar>

        <md-layout md-row md-align="center">
            <div class="md-flex-small md-flex-medium-70 md-flex-50">
                <md-layout md-row style="flex-wrap: nowrap;" class="md-margin">
                    <input type="text" class="md-flex-100 co-search-input co-search-bar md-whiteframe-2dp"
                            placeholder="Search" v-model="query" @keyup.enter="search" autofocus>

                    <md-layout md-column md-align="center">
                        <md-button @click.native="search" class="md-fab" style="margin-right: 0;">
                            <md-icon>search</md-icon>
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
                    </md-list-item>
                </md-list>
            </div>
        </md-layout>
    </div>
</template>

<script>
import 'Proxies/mdLayout';
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import 'Proxies/mdList';
import 'Proxies/mdWhiteframe';
import coToolbar from 'Components/co-toolbar';
import { search, musicScores } from 'Common/urls';
import axios from 'axios';

export default {
    name : 'search',
    props : [ 'coUsername', 'coQuery' ],
    data() {
        return { scores : [] };
    },
    methods : {
        scoreUrl(score) {
            return musicScores(score.id);
        },
        search() {
            if (!this.query) {
                return;
            }

            const params = {
                query : this.query
            };
            axios.get(search(), { params }).then(res => {
                this.scores = res.data;
            }, error => {
                const msg = (error.response && error.response.data.error) || error.message;
                console.log(msg);
            });
        }
    },
    created() {
        this.query = this.coQuery || '';
        this.search();
    },
    components : {
        coToolbar
    }
}
</script>

<style>
.md-list-item.md-margin {
    margin-top: 8px;
    margin-bottom: 8px;
}
.co-search-input.co-search-bar {
    min-width: 50%;
    margin-left: 0;
    margin-top: 6px;
    margin-bottom: 6px;
    margin-right: 8px;
    height: 56px;
    font-size: 20px;
    color: #434343;
    padding-left: 16px;
    padding-right: 16px;
}
</style>