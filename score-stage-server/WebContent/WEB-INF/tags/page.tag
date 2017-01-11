<%@ tag trimDirectiveWhitespaces="true"%>
<%@ attribute name="title"%>
<%@ attribute name="page" required="true"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://www.springframework.org/tags" prefix="spring"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimal-ui" />
<c:if test="${empty title}">
    <c:set var="title">Score Stage</c:set>
</c:if>
<title>${title}</title>

<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700" type="text/css">
<script type="text/javascript" src="<spring:url value="${ReqMappings.RESOURCES}/${page}.js"/>"></script>
</head>

<body>
    <jsp:doBody/>
</body>
</html>