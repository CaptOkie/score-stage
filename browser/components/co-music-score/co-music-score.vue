<template>
    <md-card class="md-flex" style="overflow: visible;" @contextmenu.native.prevent="contextmenu">
        <md-card-header class="co-music-score-header">
            <h2 class="md-display-3">{{title}}</h2>
        </md-card-header>

        <md-card-content>
            <co-score-editor v-if="loaded" :co-measures="measures" :co-groups="groups" :co-bar-scale="2"
                    @cursor-changed="cursorChanged">
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
                    <span>Change time signature</span>
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
import { Measures, Measure, Group, Bar, Tick, Note } from './types';
import { getNote } from './note-utils';
import { musicScores } from 'Common/urls';

const LOCATION = window.location.pathname;

export default {
    name : 'co-music-score',
    props : [ 'coNote', 'coCanEdit' ],
    data() {
        return { score : undefined, menuX : 0, menuY : 0, saveQueue : [] };
    },
    computed : {
        loaded() {
            return (this.score && true) || false;
        },
        title() {
            return this.score && this.score.title;
        },
        measures() {
            return this.score && this.score.measures;
        },
        groups() {
            return this.score && this.score.groups;
        },
        canEdit() {
            return this.coCanEdit || false;
        }
    },
    methods : {
        contextmenu(event) {
            if (!this.canEdit) {
                return;
            }

            this.menuX = event.clientX;
            this.menuY = event.clientY;
            this.$nextTick(() => this.$refs.menu.open());
        },
        addMeasure() {
            if (!this.canEdit || !this.cursor) {
                return;
            }

            const before = this.cursor.measure;
            const bars = before.bars.map(bar => new Bar(bar.clef, bar.keySig));
            const measure = new Measure(before.timeSig, bars);
            this.score.measures.addAfter(before, measure);


            this.saveQueue.push(() => {
                const url = musicScores.measure(this.score.id);
                const body = {
                    id : before.id,
                    rev : this.score.rev
                };
                return axios.post(url, body).then(res => {
                    measure.id = res.data.id;
                    return res;
                });
            });
        },
        deleteMeasure() {
            if (!this.canEdit || !this.cursor || !this.score.measures.head.next) {
                return;
            }

            const measure = this.cursor.measure;
            this.score.measures.remove(measure);

            this.saveQueue.push(() => {
                const url = musicScores.measure(this.score.id);
                const params = {
                    id : measure.id,
                    rev : this.score.rev
                };
                return axios.delete(url, { params });
            });
        },
        setTimeSig() {
            if (!this.canEdit || !this.cursor) {
                return;
            }

            this.$refs.timeSigDialog.show(this.cursor.measure.timeSig, data => {
                const measure = this.cursor.measure;
                measure.timeSig = data.timeSig;
                const timeSig = data.timeSig.getRaw();

                this.saveQueue.push(() => {
                    const url = musicScores.timeSig(this.score.id);
                    const body = {
                        data : {
                            id : measure.id,
                            timeSig
                        },
                        rev : this.score.rev
                    };
                    return axios.post(url, body);
                });
            });
        },
        setKeySig() {
            if (!this.canEdit || !this.cursor) {
                return;
            }

            this.$refs.keySigDialog.show(this.cursor.bar.keySig, data => {
                this.cursor.bar.keySig = data.keySig;
                const measure = this.cursor.measure;
                const barIndex = this.cursor.barIndex;

                this.saveQueue.push(() => {
                    const url = musicScores.keySig(this.score.id);
                    const body = {
                        data : {
                            id : measure.id,
                            index : barIndex,
                            keySig : data.keySig
                        },
                        rev : this.score.rev
                    };
                    return axios.post(url, body);
                });
            });
        },
        setClef() {
            if (!this.canEdit || !this.cursor) {
                return;
            }

            this.$refs.clefDialog.show(this.cursor.bar.clef, data => {
                this.cursor.bar.clef = data.clef;
                const measure = this.cursor.measure;
                const barIndex = this.cursor.barIndex;

                this.saveQueue.push(() => {
                    const url = musicScores.clef(this.score.id);
                    const body = {
                        data : {
                            id : measure.id,
                            index : barIndex,
                            clef : data.clef
                        },
                        rev : this.score.rev
                    };
                    return axios.post(url, body);
                });
            });
        },
        addStaff() {
            if (!this.canEdit || !this.cursor) {
                return;
            }

            this.$refs.newStaffDialog.show(this.getGroupIndex(), data => {
                if (data.index === this.score.groups.length) {
                    this.score.groups.push(new Group(data.name, data.abbr));
                }
                else {
                    this.score.groups[data.index].count++;
                }
                let index = 0;
                for (let i = 0; i <= data.index; ++i) {
                    index += this.score.groups[i].count;
                }
                for (const measure of this.score.measures) {
                    const bar = new Bar('treble', 'C');
                    if (index < measure.bars.length) {
                        measure.bars.splice(index, 0, bar);
                    }
                    else {
                        measure.bars.push(bar);
                    }
                }

                this.saveQueue.push(() => {
                    const url = musicScores.staff(this.score.id);
                    const body = {
                        data : data,
                        rev : this.score.rev
                    };
                    return axios.post(url, body);
                });
            });
        },
        deleteStaff() {
            if (!this.canEdit || !this.cursor || (this.score.groups.length < 2 && this.score.groups[0].count < 2)) {
                return;
            }

            const index = this.cursor.barIndex;
            for (const measure of this.score.measures) {
                measure.bars.splice(index, 1);
            }

            let groupIndex = this.getGroupIndex();
            const group = this.score.groups[groupIndex];
            group.count--;
            if (!group.count) {
                this.score.groups.splice(groupIndex, 1);
            }

            this.saveQueue.push(() => {
                const url = musicScores.staff(this.score.id);
                const params = {
                    index,
                    rev : this.score.rev
                };
                return axios.delete(url, { params });
            });
        },
        addTick() {
            if (!this.canEdit || !this.coNote || !this.cursor) {
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

            const barIndex = this.cursor.barIndex;
            const measure = this.cursor.measure;
            const before = this.cursor.tickInfo.before;
            const rawTick = tick.getRaw();

            this.saveQueue.push(() => {
                const url = musicScores.tick(this.score.id);
                const body = {
                    data : {
                        id : measure.id,
                        barIndex,
                        index,
                        tick : rawTick
                    },
                    rev : this.score.rev
                };

                if (before) {
                    return axios.post(url, body);
                }
                return axios.put(url, body);
            });
        },
        deleteTick() {
            if (!this.canEdit || !this.cursor || this.cursor.tickInfo.before) {
                return;
            }

            const bar = this.cursor.bar;
            const note = getNote(bar.clef, this.cursor.line);
            const ticks = bar.ticks;
            const index = this.cursor.tickInfo.index;
            const tick = ticks[index];
            let removed = false;
            // Call isRest after incase deleting the last note turns it into a rest
            if (!tick.delete(note) || tick.isRest()) {
                ticks.splice(index, 1);
                removed = true;
            }

            const measure = this.cursor.measure;
            const barIndex = this.cursor.barIndex;
            const rawTick = tick.getRaw();

            this.saveQueue.push(() => {
                const url = musicScores.tick(this.score.id);
                if (removed) {
                    const params = {
                        id : measure.id,
                        barIndex,
                        index,
                        rev : this.score.rev
                    };
                    return axios.delete(url, { params });
                }

                const body = {
                    data : {
                        id : measure.id,
                        barIndex,
                        index,
                        tick : rawTick
                    },
                    rev : this.score.rev
                };
                return axios.put(url, body);
            });
        },
        getGroupIndex() {
            if (!this.cursor) {
                return undefined;
            }

            const index = this.cursor.barIndex;
            let groupIndex = 0;
            let count = 0;
            for (const group of this.score.groups) {
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

        const watchSaveQueue = () => {
            let unwatch = undefined;
            const doSave = () => {
                if (unwatch) {
                    unwatch();
                    unwatch = undefined;
                }
                const operation = this.saveQueue.shift();
                if (operation) {
                    operation().then(res => {
                        this.score.rev = res.data.rev;
                        doSave();
                    }, error => {
                        const msg = (error.response && error.response.data.error) || error.message;
                        console.log(msg);
                    });
                }
                else {
                    watchSaveQueue();
                }
            };
            unwatch = this.$watch('saveQueue', doSave);
        };

        axios.get(LOCATION).then(res => {
            this.score = {
                id : res.data.id,
                title : res.data.title,
                measures : Measures.create(res.data.measures),
                groups : res.data.groups.map(group => Group.create(group)),
                rev : res.data.rev,
                isOwner : res.data.isOwner
            };
            this.$emit('co-score-loaded', this.score);
            watchSaveQueue();
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