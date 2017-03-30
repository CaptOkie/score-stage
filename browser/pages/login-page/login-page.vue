<template>
    <md-layout id="login-page" md-column>
        <co-toolbar></co-toolbar>

        <md-layout md-row md-align="center">
            <h1 class="md-display-1 md-primary">Score Stage</h1>
        </md-layout>
        
        <md-layout class="md-padding" md-row md-align="center">
            <form class="md-flex-xsmall-100 md-flex-small-60 md-flex-medium-50 md-flex-large-30 md-flex-xlarge-30"
                    method="post" :action="loginUrl">
                <md-card>
                    <md-card-content>
                        <md-input-container>
                            <md-icon>person</md-icon>
                            <label>Username</label>
                            <md-input required name="username" type="text" autofocus></md-input>
                        </md-input-container>
                        
                        <md-input-container>
                            <md-icon>lock</md-icon>
                            <label>Password</label>
                            <md-input required name="password" type="password"></md-input>
                        </md-input-container>
                    </md-card-content>
                    
                    <md-card-actions>
                        <md-button :href="registerUrl">Register</md-button>
                        <md-button class="md-raised md-primary" type="submit">Login</md-button>
                    </md-card-actions>
                </md-card>
            </form>
        </md-layout>
    </md-layout>
</template>

<script>
import 'Proxies/mdLayout';
import 'Proxies/mdCard';
import 'Proxies/mdInputContainer';
import 'Proxies/mdButton';
import 'Proxies/mdIcon';
import coToolbar from 'Components/co-toolbar';
import { register, login } from 'Common/urls';

export default {
    name : 'login',
    data() {
        return { registerUrl : register(), loginUrl : login() };
    },
    components : {
        coToolbar
    }
}
</script>

<style>
</style>