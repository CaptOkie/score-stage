<template>
    <md-dialog ref="dialog" @open="onOpen" @close="onClose">
        <md-dialog-title>Key signature</md-dialog-title>

        <md-dialog-content>
            <md-layout md-column>
                <md-radio name="co-group-type" id="co-group-existing" md-value="existing" v-model="groupType">Existing instrument</md-radio>

                <md-input-container>
                    <label>Instrument</label>
                    <md-select v-model="eGroup" :disabled="groupType !== 'existing'">
                        <md-option v-for="(group, index) in coGroups" :key="index" :value="index + 1">{{group.name}} ({{group.abbr}})</md-option>
                    </md-select>
                </md-input-container>

                <md-radio name="co-group-type" id="co-group-new" md-value="new" v-model="groupType">New instrument</md-radio>

                <md-input-container>
                    <label>Name</label>
                    <md-input v-model="nGroup.name" :disabled="groupType !== 'new'" type="text"></md-input>
                </md-input-container>

                <md-input-container>
                    <label>Abbreviation</label>
                    <md-input v-model="nGroup.abbr" :disabled="groupType !== 'new'" type="text"></md-input>
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
        return { groupType : 'existing', eGroup : 1, nGroup : { name : '', abbr : '' } };
    },
    computed : {
        valid() {
            if (this.groupType === 'new') {
                return (this.nGroup.name.length && this.nGroup.abbr.length && true) || false;
            }
            return (this.eGroup && true) || false;
        }
    },
    methods : {
        show(current, success) {
            this.success = success;
            this.eGroup = current + 1;
            this.nGroup = { name : '', abbr : '' };
            this.groupType = 'existing';
            this.$refs.dialog.open();
        },
        cancel() {
            this.$refs.dialog.close();
        },
        okay() {
            const selection = { eGroup : this.eGroup - 1 };
            if (this.groupType === 'new') {
                delete selection.eGroup;
                selection.nGroup = new Group(this.nGroup.name, this.nGroup.abbr);
            }
            this.success(selection);
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
