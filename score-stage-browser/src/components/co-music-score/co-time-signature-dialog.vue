<template>
    <md-dialog ref="dialog">
        <md-dialog-title>Time Signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio v-model="selected" md-value="common">Common Time</md-radio>
                <md-radio v-model="selected" md-value="cut">Cut Time</md-radio>
                <md-radio v-model="selected" md-value="custom">Custom</md-radio>
            </md-layout>

            <md-input-container>
                <label>Beat Count</label>
                <md-input :disabled="!isCustom" type="number" v-model="custom.upper"></md-input>
            </md-input-container>

            <md-input-container>
                <label>Beat Unit</label>
                <md-input :disabled="!isCustom" type="number" v-model="custom.lower"></md-input>
            </md-input-container>
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
import { TimeSignature } from './types';

export default {
    name : 'co-time-signature-dialog',
    data() {
        return { common : TimeSignature.COMMON, cut : TimeSignature.CUT, custom : new TimeSignature(4, 4), selected : 'common' };
    },
    computed : {
        isCustom() {
            return this.selected === 'custom';
        }
    },
    methods : {
        show(current, success) {
            this.success = success;
            this.selected = (current === this.common && 'common') || (current === this.cut && 'cut') || 'custom';
            if (this.isCustom) {
                this.custom = current;
            }
            this.$refs.dialog.open();
        },
        cancel() {
            this.custom = new TimeSignature(4, 4);
            this.$refs.dialog.close();
        },
        okay() {
            const timeSig = this[this.selected];
            this.success({ timeSig });
            this.cancel();
        }
    }
}
</script>