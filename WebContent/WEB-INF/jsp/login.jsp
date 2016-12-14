<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib tagdir="/WEB-INF/tags/" prefix="tags"%>

<tags:page>
    <md-content flex layout="column" layout-align="start stretch">
        <div class="md-margin" layout="column" layout-align='start center' flex="none">
            <h1 class="md-display-1" md-colors="{ color : 'primary-800' }">Score Stage</h1>
        </div>
        
        <spring:url var="loginUrl" value="${ReqMappings.LOGIN}"/>
        <form:form method="post" action="${loginUrl}" layout="row" flex="none" cssClass="md-margin">
            <md-card layout="column" flex="100" flex-sm="60" flex-offset-sm="20" flex-gt-sm="50" flex-offset-gt-sm="25" flex-gt-md="30" flex-offset-gt-md="35">
                <md-card-content layout="column">
                    <md-input-container>
                        <label>Username</label>
                        <input type="text" name="${ReqParams.USERNAME}" autofocus>
                    </md-input-container>

                    <md-input-container>
                        <label>Password</label>
                        <input type="password" name="${ReqParams.PASSWORD}">
                    </md-input-container>
                </md-card-content>
                
                <md-card-actions layout="column" layout-align="start stretch">
                    <md-button type="submit" class="md-primary md-raised">Login</md-button>
                </md-card-actions>
            </md-card>
        </form:form>    
    </md-content>
</tags:page>