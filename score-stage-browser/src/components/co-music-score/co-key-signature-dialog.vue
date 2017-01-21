<template>
    <md-dialog ref="dialog">
        <md-dialog-title>Key signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio v-for="(sig, index) in keySigs" v-model="keySig" :id="'key-sig' + index" :md-value="sig.key">{{sig.label}}</md-radio>
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
import { Flow } from 'vexflow';

function parseKeySpec(key) {
    const data = Flow.keySignature.keySpecs[key];
    const acc = (data.acc && (data.acc.toLowerCase() === 'b' ? '♭' : '♯')) || '';
    const minor = key[key.length - 1].toLowerCase() === 'm';
    const label = key[0].toUpperCase() + acc + ' ' + (minor ? 'Minor' : 'Major');
    return { key, label };
}

export default {
    name : 'co-key-signature-dialog',
    data() {
        const keySigs = Object.keys(Flow.keySignature.keySpecs).map(parseKeySpec);
        return { keySigs, keySig : keySigs[0].key };
    },
    methods : {
        show(current, success) {
            this.success = success;
            this.keySig = current;
            this.$refs.dialog.open();
        },
        cancel() {
            this.$refs.dialog.close();
        },
        okay() {
            this.success({ keySig : this.keySig });
            this.cancel();
        }
    }
}
</script>