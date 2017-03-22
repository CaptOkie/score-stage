<template>    
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <form :action="scoresUrl" method="post" class="md-column md-flex" style="display: flex;">
            <md-dialog-title>New music score</md-dialog-title>

            <md-dialog-content>
                <md-input-container>
                    <label>Title</label>
                    <md-input v-model="title" name="title" type="text" required></md-input>
                </md-input-container>

                <h4 class="md-subheading">Initial instrument</h4>

                <md-input-container>
                    <label>Name</label>
                    <md-input v-model="gName" name="gName" type="text" required></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Abbreviation</label>
                    <md-input v-model="gAbbr" name="gAbbr" type="text" required></md-input>
                </md-input-container>
            </md-dialog-content>

            <md-dialog-actions>
                <md-button class="md-primary" type="button" @click.native="cancel">Cancel</md-button>
                <md-button class="md-primary" type="submit" :disabled="!valid">Create</md-button>
            </md-dialog-actions>
        </form>
    </md-dialog>
</template>

<script>
import 'Proxies/mdDialog';
import 'Proxies/mdInputContainer';
import 'Proxies/mdButton';
import coScroll from 'Services/co-scroll';
import { musicScores } from 'Common/urls';
    
export default {
    name : 'co-create-score-dialog',
    data() {
        return { scoresUrl : musicScores(), title : '', gName : '', gAbbr : '' };
    },
    computed : {
        valid() {
            return this.title.length && this.gName.length && this.gAbbr.length;
        }
    },
    methods : {
        show() {
            this.title = '';
            this.gName = '';
            this.gAbbr = '';
            this.$refs.dialog.open();
        },
        cancel() {
            this.$refs.dialog.close();
        },
        onOpen() {
            coScroll.disable();
        },
        onClose() {
            coScroll.enable();
        }
    }
}
</script>