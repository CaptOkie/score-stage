<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Key signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio name="co-group-radio" v-for="(group, i) in coGroups" :key="i" :md-value="i"
                        :id="'co-group-radio-' + i" v-model="index">
                    {{group.name}} ({{group.abbr}})
                </md-radio>

                <md-radio name="co-group-radio" :id="'co-group-radio-' + length"
                        :md-value="length" v-model="index">
                    New instrument
                </md-radio>

                <md-input-container>
                    <label>Name</label>
                    <md-input v-model="name" :disabled="index !== length" type="text"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Abbreviation</label>
                    <md-input v-model="abbr" :disabled="index !== length" type="text"></md-input>
                </md-input-container>
            </md-layout>
        </md-dialog-content>

        <md-dialog-actions>
            <md-button class="md-primary" type="button" @click.native="cancel">Cancel</md-button>
            <md-button class="md-primary" type="button" :disabled="!valid" @click.native="okay">Ok</md-button>
        </md-dialog-actions>
    </md-dialog>
</template>

<script>
import 'Proxies/mdLayout';
import 'Proxies/mdDialog';
import 'Proxies/mdRadio';
import 'Proxies/mdButton';
import 'Proxies/mdSelect';
import 'Proxies/mdInputContainer';
import coScroll from 'Services/co-scroll';
import { Group } from './types';

export default {
    name : 'co-key-signature-dialog',
    props : [ 'coGroups' ],
    data() {
        return { index : 0, name : '', abbr : '' };
    },
    computed : {
        valid() {
            if (this.index === this.length) {
                return (this.name.length && this.abbr.length && true) || false;
            }
            return true;
        },
        length() {
            return this.coGroups ? this.coGroups.length : 0;
        }
    },
    methods : {
        show(current, success) {
            this.success = success;
            this.index = current;
            this.name = '';
            this.abbr = '';
            this.$refs.dialog.open();
        },
        cancel() {
            this.$refs.dialog.close();
        },
        okay() {
            this.success({ index : this.index, name : this.name, abbr : this.abbr });
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
