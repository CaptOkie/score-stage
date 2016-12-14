<%@ tag trimDirectiveWhitespaces="true"%>
<%@ attribute name="title"%>
<%@ attribute name="scripts" fragment="true"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>

<!DOCTYPE html>
<html ng-app="score-stage">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimal-ui" />
<c:if test="${empty title}">
    <c:set var="title">Score Stage</c:set>
</c:if>
<title>${title}</title>

<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" type="text/css">
<link rel="stylesheet" href="<spring:url value="${ReqMappings.RESOURCES}/angular/angular-csp.css"/>">
<link rel="stylesheet" href="<spring:url value="${ReqMappings.RESOURCES}/angular-material/angular-material.min.css"/>">

<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/angular/angular.min.js"/>"></script>
<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/angular-animate/angular-animate.min.js"/>"></script>
<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/angular-aria/angular-aria.min.js"/>"></script>
<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/angular-messages/angular-messages.min.js"/>"></script>
<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/angular-sanitize/angular-sanitize.min.js"/>"></script>
<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/angular-material/angular-material.min.js"/>"></script>

<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/js/app.js"/>"></script>
<c:if test="${not empty scripts}">
    <jsp:invoke fragment="scripts"/>
</c:if>
</head>

<body layout="row" class="ng-cloak">
    <jsp:doBody/>
</body>
</html>