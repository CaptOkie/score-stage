<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib tagdir="/WEB-INF/tags/" prefix="tags"%>

<tags:page title="Home">
    <jsp:attribute name="scripts">
        <script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/vexflow/releases/vexflow-min.js"/>"></script>
        <script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/js/types/music-types.js"/>"></script>
        <script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/js/components/music-score.js"/>"></script>
        <script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/js/pages/home.js"/>"></script>
    </jsp:attribute>
    
    <jsp:body>
        <ss-home layout="column" flex></ss-home>
    </jsp:body>
</tags:page>