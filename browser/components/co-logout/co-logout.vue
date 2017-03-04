<template>
    <form :action="LOGOUT" method="POST">
        <slot>
            <md-button type="submit">Logout</md-button>
        </slot>
    </form>
</template>

<script>
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import { LOGOUT } from 'Common/urls';

export default {
    name : 'co-logout',
    data() {
        return { LOGOUT };
    }
}
</script>