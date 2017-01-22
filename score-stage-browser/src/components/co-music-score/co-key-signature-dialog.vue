<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Key signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-row>
                <md-layout md-column v-for="(type, i) in keyTypes">
                    <md-radio v-for="(sig, j) in type.keySigs" v-model="keySig" :id="'key-sig' + i + '-' + j" name="key-sig" :md-value="sig.key">
                        {{sig.label}}
                    </md-radio>
                </md-layout>
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
import { Flow } from 'vexflow';

function parseKeySpec(key) {
    const data = Flow.keySignature.keySpecs[key];
    const minor = key[key.length - 1].toLowerCase() === 'm';
    const acc = (key.length > (minor ? 2 : 1) && data.acc && (data.acc.toLowerCase() === 'b' ? '♭' : '♯')) || '';
    const label = key[0].toUpperCase() + acc + ' ' + (minor ? 'Minor' : 'Major');
    return { key, label, minor };
}

export default {
    name : 'co-key-signature-dialog',
    data() {
        const keySigs = Object.keys(Flow.keySignature.keySpecs).map(parseKeySpec);
        const majors = { label : 'Major', keySigs : keySigs.filter(keySig => !keySig.minor) };
        const minors = { label : 'Minor', keySigs : keySigs.filter(keySig => keySig.minor) };
        return { keyTypes : [ majors, minors ], keySig : keySigs[0].key };
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