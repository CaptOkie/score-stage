<template>
    <md-layout id="register-page" md-column>
        <co-toolbar></co-toolbar>

        <md-layout md-row md-align="center">
            <h1 class="md-display-1 md-primary">Register</h1>
        </md-layout>
        
        <md-layout class="md-padding" md-row md-align="center">
            <form class="md-flex-xsmall-100 md-flex-small-60 md-flex-medium-50 md-flex-large-30 md-flex-xlarge-30"
                    method="post" :action="registerUrl">
                <md-card>
                    <md-card-content>
                        <md-input-container>
                            <label>Username</label>
                            <md-input required name="username" type="text" autofocus></md-input>
                        </md-input-container>
                        
                        <md-input-container>
                            <label>Password</label>
                            <md-input required name="password" type="password"></md-input>
                        </md-input-container>

                        <md-input-container>
                            <label>Confirm Password</label>
                            <md-input required name="cPassword" type="password"></md-input>
                        </md-input-container>
                    </md-card-content>
                    
                    <md-card-actions>
                        <md-button :href="loginUrl">Login</md-button>
                        <md-button class="md-raised md-primary" type="submit">Register</md-button>
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
import coToolbar from 'Components/co-toolbar';
import { register, login } from 'Common/urls';

export default {
    name : 'register',
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