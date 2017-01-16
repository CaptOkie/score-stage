<template>
    <form :action="LOGOUT" method="POST">
        <slot>
            <md-button type="submit">Logout</md-button>
        </slot>

        <div>
            <input type="hidden" :name="CSRF_NAME" :value="CSRF_VALUE">
        </div>
    </form>
</template>

<script>
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import { CSRF_NAME, CSRF_VALUE } from 'Common/csrf';
import { LOGOUT } from 'Common/urls';

export default {
    name : 'co-logout',
    data() {
        return { LOGOUT, CSRF_NAME, CSRF_VALUE };
    }
}
</script>