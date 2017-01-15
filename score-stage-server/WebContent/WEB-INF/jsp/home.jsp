<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>
<%@ taglib tagdir="/WEB-INF/tags/" prefix="tags"%>

<tags:page title="Home" page="home">
    <jsp:body>
        <co-home co-context-path="<spring:url value="/"/>"></co-home>
    </jsp:body>
</tags:page>