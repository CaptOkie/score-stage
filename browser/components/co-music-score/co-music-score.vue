<template>
    <md-card class="md-flex" style="overflow: visible;" @contextmenu.native.prevent="contextmenu">
        <md-card-header class="co-music-score-header">
            <h2 class="md-display-3">{{title}}</h2>
        </md-card-header>

        <md-card-content>
            <co-score-editor v-if="loaded" :co-measures="measures" :co-groups="groups" :co-bar-scale="2" @cursor-changed="cursorChanged">
            </co-score-editor>
        </md-card-content>

        <md-menu ref="menu" style="display: none;" :md-size="6" :md-offset-x="menuX" :md-offset-y="menuY">
            <div md-menu-trigger></div>
            <md-menu-content class="md-dense">
                <md-menu-item @click.native="addMeasure">
                    <md-icon>playlist_add</md-icon>
                    <span>Add measure</span>
                    <span class="md-list-action co-score-key-text">Ctrl+A</span>
                </md-menu-item>

                <md-menu-item @click.native="deleteMeasure">
                    <md-icon>delete_sweep</md-icon>
                    <span>Delete measure</span>
                    <span class="md-list-action co-score-key-text">Ctrl+D</span>
                </md-menu-item>

                <md-menu-item @click.native="setTimeSig" class="md-inset">
                    <span>Edit time signature</span>
                    <span class="md-list-action co-score-key-text">Ctrl+T</span>
                </md-menu-item>

                <md-divider></md-divider>

                <md-menu-item @click.native="setKeySig">
                    <md-icon>vpn_key</md-icon>
                    <span>Change key signature</span>
                    <span class="md-list-action co-score-key-text">Ctrl+K</span>
                </md-menu-item>

                <md-menu-item @click.native="setClef" class="md-inset">
                    <span>Change clef</span>
                    <span class="md-list-action co-score-key-text">Ctrl+L</span>
                </md-menu-item>

                <md-divider></md-divider>

                <md-menu-item @click.native="addStaff">
                    <md-icon>add</md-icon>
                    <span>Add staff</span>
                    <span class="md-list-action co-score-key-text">Ctrl+Shift+A</span>
                </md-menu-item>

                <md-menu-item @click.native="deleteStaff">
                    <md-icon>delete</md-icon>
                    <span>Delete staff</span>
                    <span class="md-list-action co-score-key-text">Ctrl+Shift+D</span>
                </md-menu-item>
            </md-menu-content>
        </md-menu>

        <co-time-signature-dialog ref="timeSigDialog"></co-time-signature-dialog>
        <co-key-signature-dialog ref="keySigDialog"></co-key-signature-dialog>
        <co-clef-dialog ref="clefDialog"></co-clef-dialog>
        <co-new-staff-dialog ref="newStaffDialog" :co-groups="groups"></co-new-staff-dialog>
    </md-card>
</template>

<script>
import 'Proxies/mdCard';
import 'Proxies/mdIcon';
import 'Proxies/mdDivider';
import 'Proxies/mdMenu';
import axios from 'axios';
import coTimeSignatureDialog from './co-time-signature-dialog.vue';
import coKeySignatureDialog from './co-key-signature-dialog.vue';
import coClefDialog from './co-clef-dialog.vue';
import coNewStaffDialog from './co-new-staff-dialog.vue';
import coScoreEditor from './co-score-editor.vue';
import { Measure, Group, Bar, Tick, Note } from './types';
import { getNote } from './note-utils';

const LOCATION = window.location.pathname;

export default {
    name : 'co-music-score',
    props : [ 'coNote' ],
    data() {
        return { title : undefined, groups : undefined, measures : undefined, menuX : 0, menuY : 0 };
    },
    computed : {
        loaded() {
            return (this.measures && this.groups && true) || false;
        }
    },
    methods : {
        contextmenu(event) {
            this.menuX = event.clientX;
            this.menuY = event.clientY;
            this.$nextTick(() => this.$refs.menu.open());
        },
        addMeasure() {
            if (this.cursor) {
                const bars = this.cursor.measure.bars.map(bar => new Bar(bar.clef, bar.keySig));
                this.measures.splice(this.cursor.index + 1, 0, new Measure(this.cursor.measure.timeSig, bars));
            }
        },
        deleteMeasure() {
            if (this.cursor && this.measures.length > 1) {
                this.measures.splice(this.cursor.index, 1);
            }
        },
        setTimeSig() {
            if (this.cursor) {
                this.$refs.timeSigDialog.show(this.cursor.measure.timeSig, data => {
                    this.cursor.measure.timeSig = data.timeSig;
                });
            }
        },
        setKeySig() {
            if (this.cursor) {
                this.$refs.keySigDialog.show(this.cursor.bar.keySig, data => {
                    this.cursor.bar.keySig = data.keySig;
                });
            }
        },
        setClef() {
            if (this.cursor) {
                this.$refs.clefDialog.show(this.cursor.bar.clef, data => {
                    this.cursor.bar.clef = data.clef;
                });
            }
        },
        addStaff() {
            if (!this.cursor || !this.groups || !this.measures) {
                return;
            }

            this.$refs.newStaffDialog.show(this.getGroupIndex(), data => {
                let group = data.eGroup;
                if (group === 0 || group) {
                    this.groups[group].count++;
                }
                else {
                    this.groups.push(data.nGroup);
                    group = this.groups.length - 1;
                }
                let index = 0;
                for (let i = 0; i <= group; ++i) {
                    index += group.count;
                }
                for (const measure of this.measures) {
                    const bar = new Bar('treble', 'C');
                    if (index < measure.bars.length) {
                        measure.bars.splice(index, 0, bar);
                    }
                    else {
                        measure.bars.push(bar);
                    }
                }
            });
        },
        deleteStaff() {
            if (!this.cursor || !this.measures || !this.groups || (this.groups.length < 2 && this.groups[0].count < 2)) {
                return;
            }

            const index = this.cursor.barIndex;
            for (const measure of this.measures) {
                measure.bars.splice(index, 1);
            }

            let groupIndex = this.getGroupIndex();
            const group = this.groups[groupIndex];
            group.count--;
            if (!group.count) {
                this.groups.splice(groupIndex, 1);
            }
        },
        addTick() {
            if (!this.coNote || !this.cursor) {
                return;
            }

            const duration = Number(this.coNote.duration);
            const bar = this.cursor.bar;
            const ticks = bar.ticks;
            const index = this.cursor.tickInfo.index;
            let tick = undefined;
            if (this.cursor.tickInfo.before) {
                tick = new Tick(duration, []);
                ticks.splice(index, 0, tick);
            }
            else {
                tick = ticks[index];
                tick.duration = duration;
            }
            if (this.coNote.rest) {
                tick.clear();
            }
            else {
                const note = getNote(bar.clef, this.cursor.line);
                tick.push(new Note(note.letter, note.octave, 'n'));
            }
        },
        deleteTick() {
            if (!this.cursor || this.cursor.tickInfo.before) {
                return;
            }

            const bar = this.cursor.bar;
            const note = getNote(bar.clef, this.cursor.line);
            const ticks = bar.ticks;
            const index = this.cursor.tickInfo.index;
            const tick = ticks[index];
            // Call isRest after incase deleting the last note turns it into a rest
            if (!tick.delete(note) || tick.isRest()) {
                ticks.splice(index, 1);
            }
        },
        getGroupIndex() {
            if (!this.cursor || !this.groups) {
                return undefined;
            }
            const index = this.cursor.barIndex;
            let groupIndex = 0;
            let count = 0;
            for (const group of this.groups) {
                count += group.count;
                if (count > index) {
                    break;
                }
                groupIndex++;
            }
            return groupIndex;
        },
        cursorChanged(cursor) {
            this.cursor = cursor;
        },
        keyup(event) {
            // TODO Ignore some events (e.g. key events on inputs)
            if (event.ctrlKey && event.shiftKey) {
                // Empty
            }
            else if (event.shiftKey) {
                switch (event.keyCode) {
                    case 65: 
                        this.addTick();
                        break;
                    case 68:
                        this.deleteTick();
                        break;
                    default:
                        // Don't care
                        break;
                }
            }
            else if (event.ctrlKey) {
                // Empty
            }
            else {
                // Empty
            }
        }
    },
    created() {

        axios.get(LOCATION).then(res => {
            this.title = res.data.title;
            this.measures = res.data.measures.map(measure => Measure.create(measure));
            this.groups = res.data.groups.map(group => Group.create(group));
        }, error => {
            const msg = (error.response && error.response.data.error) || error.message;
            console.log(msg);
        });
    },
    mounted() {
        document.body.addEventListener('keyup', this.keyup);
    },
    beforeDestroy() {
        document.body.removeEventListener('keyup', this.keyup);
    },
    components : {
        coTimeSignatureDialog,
        coKeySignatureDialog,
        coClefDialog,
        coNewStaffDialog,
        coScoreEditor
    }
}
</script>

<style>
.co-music-score-header {
    text-align: center;
}
.co-music-score-header h1,
.co-music-score-header h2,
.co-music-score-header h3,
.co-music-score-header h4,
.co-music-score-header h5,
.co-music-score-header h6 {
    font-weight: 300;
}

.md-list-item .md-list-item-holder .md-list-action.co-score-key-text {
    margin-right: 0;
    color: rgba(0, 0, 0, .57);
}
.md-menu-content.md-dense .md-list-item .md-list-item-container {
    min-height: 40px;
    font-size: 13px;
}
</style>