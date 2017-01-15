<template>
    <md-sidenav ref="sidenav" class="md-left md-fixed">
        <md-toolbar class="md-account-header">
            <p>{{coContextPath}}</p>
        </md-toolbar>
    </md-sidenav>
</template>

<script>
import 'Proxies/mdSidenav';
import 'Proxies/mdToolbar'

export default {
    name : 'co-sidenav',
    props : [ 'coContextPath' ],
    methods : {
        open() {
            this.$refs.sidenav.open();
        },
        close() {
            this.$refs.sidenav.close();
        },
        toggle() {
            this.$refs.sidenav.toggle();
        }
    }
}
</script>