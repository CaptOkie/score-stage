<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Clef</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio v-model="selection" id="clef-percussion" name="clef" :md-value="percussion.key"
                        class="co-clef-radio" style="justify-content: center;">
                    <img v-once :src="percussion.label" width="96"></img>
                </md-radio>

                <md-layout md-row>
                    <md-layout md-column v-for="(col, i) in columns" :key="i" class="co-clef-column">
                        <md-radio v-for="(clef, j) in col" :key="j" v-model="selection" :id="'clef-' + i + '-' + j"
                                name="clef" :md-value="clef.key" class="co-clef-radio">
                            <img v-once :src="clef.label" width="96"></img>
                        </md-radio>
                    </md-layout>
                </md-layout>
            </md-layout>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" type="button" @click.native="cancel">Cancel</md-button>
            <md-button class="md-primary" type="button" @click.native="okay">Ok</md-button>
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
        const percussion = CLEFS[0];
        const index = (CLEFS.length + 1) / 2;
        const columns = [ CLEFS.slice(1, index), CLEFS.slice(index, CLEFS.length) ]
        return { percussion : percussion, columns, selection : CLEFS[0].key };
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

<style>
.md-radio.co-clef-radio {
    align-items: center;
    margin: 0;
}
.md-radio.co-clef-radio .md-radio-label {
    height: auto;
}
.co-clef-column:first-of-type {
    margin-right: 16px;
}
.co-clef-column:last-of-type {
    margin-left: 16px;
}
</style>