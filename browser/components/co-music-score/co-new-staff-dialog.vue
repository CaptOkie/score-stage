<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Key signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio name="co-key-sig" id="co-key-sig-empty" :md-value="empty.key" v-model="keySig"
                        class="co-key-sig-radio" style="justify-content: center;">
                    <img v-once :src="empty.label" width="96"></img>
                </md-radio>

                <md-layout md-row>
                    <md-layout md-column style="margin-right: 16px;">
                        <md-radio v-for="(sig, index) in flats" :key="index" name="co-key-sig" :id="'co-key-sig-flat-' + index"
                                :md-value="sig.key" v-model="keySig" class="co-key-sig-radio">
                            <img v-once :src="sig.label" width="96"></img>
                        </md-radio>
                    </md-layout>

                    <md-layout md-column style="margin-left: 16px;">
                        <md-radio v-for="(sig, index) in sharps" :key="index" name="co-key-sig" :id="'co-key-sig-sharp-' + index"
                                :md-value="sig.key" v-model="keySig" class="co-key-sig-radio">
                            <img v-once :src="sig.label" width="96"></img>
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
import 'Proxies/mdButton';
import 'Proxies/mdInputContainer';
import coScroll from 'Services/co-scroll';

export default {
    name : 'co-key-signature-dialog',
    props : [ 'coGroups' ],
    data() {
        const empty = KEY_SIGNATURES[0];
        const index = (KEY_SIGNATURES.length + 1) / 2;
        const flats = KEY_SIGNATURES.slice(1, index);
        const sharps = KEY_SIGNATURES.slice(index, KEY_SIGNATURES.length);
        return { empty, flats, sharps, keySig : empty.key };
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

<style>
.md-radio.co-key-sig-radio {
    align-items: center;
    margin: 0;
}
.md-radio.co-key-sig-radio .md-radio-label {
    height: auto;
}
</style>