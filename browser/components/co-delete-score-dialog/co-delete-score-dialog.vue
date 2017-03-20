<template>
    <md-dialog-confirm :md-title="'Delete ' + title + '?'" md-ok-text="Delete" md-cancel-text="Cancel"
            md-content="This will permanently delete the score" @open="onOpen" @close="onClose" ref="dialog">
    </md-dialog-confirm>
</template>

<script>
import 'Proxies/mdDialog';
import 'Proxies/mdButton';
import coScroll from 'Services/co-scroll';

export default {
    name : 'co-delete-score-dialog',
    data() {
        return { score : undefined };
    },
    computed : {
        title() {
            return this.score && this.score.title;
        }
    },
    methods : {
        show(score, success) {
            this.score = score;
            this.success = success;
            this.$refs.dialog.open();
        },
        onOpen() {
            coScroll.disable();
        },
        onClose(type) {
            if (type === 'ok') {
                this.success();
            }
            coScroll.enable();
        }
    }
}
</script>