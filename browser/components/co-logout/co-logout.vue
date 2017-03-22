<template>
    <form :action="logoutUrl" method="POST">
        <slot>
            <md-button type="submit">Logout</md-button>
        </slot>
    </form>
</template>

<script>
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import { logout } from 'Common/urls';

export default {
    name : 'co-logout',
    data() {
        return { logoutUrl : logout() };
    }
}
</script>