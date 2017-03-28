<template>
    <md-layout id="login-page" md-column>
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
                        <md-button :href="loginUrl">Cancel</md-button>
                        <md-button class="md-raised md-primary" type="submit">Submit</md-button>
                    </md-card-actions>
                </md-card>
            </form>
        </md-layout>
    </md-layout>
</template>

<script>
import mdLayout from 'Proxies/mdLayout';
import mdCard from 'Proxies/mdCard';
import mdInputContainer from 'Proxies/mdInputContainer';
import mdButton from 'Proxies/mdButton';
import { register, login } from 'Common/urls';

export default {
    name : 'register',
    data() {
        return { registerUrl : register(), loginUrl : login() };
    }
}
</script>

<style>
</style>