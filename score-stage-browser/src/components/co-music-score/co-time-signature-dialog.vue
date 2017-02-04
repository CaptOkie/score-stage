<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Time signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-layout md-row>
                    <md-radio v-model="selected" name="time-sig" id="time-sig-common" md-value="common" class="co-time-sig-radio">
                        <img v-once :src="commonTime" width="32"></img>
                    </md-radio>

                    <md-radio v-model="selected" name="time-sig" id="time-sig-cut" md-value="cut" class="co-time-sig-radio">
                        <img v-once :src="cutTime" width="32"></img>
                    </md-radio>
                </md-layout>

                <md-radio v-model="selected" name="time-sig" id="time-sig-custom" md-value="custom">Custom</md-radio>

                <md-input-container>
                    <label>Beat Count</label>
                    <md-input :disabled="!isCustom" type="number" v-model="upper"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Beat Unit</label>
                    <md-input :disabled="!isCustom" type="number" v-model="lower"></md-input>
                </md-input-container>
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
import { TimeSignature } from './types';
import { commonTime, cutTime } from './imgs';

function toSelect(current) {
    switch (current.vexFormat) {
        case TimeSignature.COMMON.vexFormat: return 'common';
        case TimeSignature.CUT.vexFormat:    return 'cut';
        default:                             return 'custom';
    }
}

function toReturn(selected, upper, lower) {
    switch (selected) {
        case 'common': return TimeSignature.COMMON;
        case 'cut':    return TimeSignature.CUT;
        default:       return new TimeSignature(upper, lower);
    }
}

export default {
    name : 'co-time-signature-dialog',
    data() {
        return { upper : 4, lower : 4, selected : 'common', commonTime, cutTime };
    },
    computed : {
        isCustom() {
            return this.selected === 'custom';
        }
    },
    methods : {
        show(current, success) {
            this.success = success;
            this.selected = toSelect(current);
            this.upper = current.upper;
            this.lower = current.lower;
            this.$refs.dialog.open();
        },
        cancel() {
            this.$refs.dialog.close();
        },
        okay() {
            const timeSig = toReturn(this.selected, this.upper, this.lower);
            this.success({ timeSig });
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
.md-radio.co-time-sig-radio {
    align-items: center;
    margin: 0;
}
.md-radio.co-time-sig-radio .md-radio-label {
    height: auto;
}
.md-radio.co-time-sig-radio:first-of-type {
    margin-right: 16px;
}
.md-radio.co-time-sig-radio:last-of-type {
    margin-left: 16px;
}
</style>