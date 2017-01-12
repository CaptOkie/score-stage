<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib tagdir="/WEB-INF/tags/" prefix="tags"%>

<tags:page page="login">
    <md-layout id="login" v-cloak md-column>
        <md-layout md-row md-align="center">
            <h1 class="md-display-1 md-primary">Score Stage</h1>
        </md-layout>
        
        <md-layout class="md-padding" md-row md-align="center">
            <spring:url var="loginUrl" value="${ReqMappings.LOGIN}"/>
            <form:form class="md-flex-xsmall-100 md-flex-small-60 md-flex-medium-50 md-flex-large-30 md-flex-xlarge-30"
                     method="post" action="${loginUrl}">
                <md-card>
                    <md-card-content>
                        <md-input-container>
                            <md-icon>person</md-icon>
                            <label>Username</label>
                            <md-input required name="username" autofocus></md-input>
                        </md-input-container>
                        
                        <md-input-container md-has-password>
                            <md-icon>lock</md-icon>
                            <label>Password</label>
                            <md-input required name="username" type="password"></md-input>
                        </md-input-container>
                    </md-card-content>
                    
                    <md-card-actions>
                        <md-button class="md-raised md-primary" type="submit">Login</md-button>
                    </md-card-actions>
                </md-card>
            </form:form>
        </md-layout>
    </md-layout>
</tags:page>