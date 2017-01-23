<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Clef</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio v-for="(clef, index) in clefs" v-model="selection" :id="'clef-' + index" name="clef" :md-value="clef.key">
                    {{clef.label}}
                </md-radio>
            </md-layout>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" type="button" @click="cancel">Cancel</md-button>
            <md-button class="md-primary" type="button" @click="okay">Ok</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import 'Proxies/mdLayout';
import 'Proxies/mdDialog';
import 'Proxies/mdRadio';
import 'Proxies/mdInputContainer';
import coScroll from 'Services/co-scroll';
import { CLEFS } from './constants';

export default {
    name : 'co-clef-dialog',
    data() {
        return { clefs : CLEFS, selection : CLEFS[0].key };
    },
    methods : {
        show(current, success) {
            this.success = success;
            this.selection = current;
            this.$refs.dialog.open();
        },
        cancel() {
            this.$refs.dialog.close();
        },
        okay() {
            this.success({ clef : this.selection });
            this.cancel();
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