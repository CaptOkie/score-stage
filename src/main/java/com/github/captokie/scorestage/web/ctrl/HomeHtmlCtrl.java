package com.github.captokie.scorestage.web.ctrl;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.github.captokie.scorestage.web.ReqMappings;
import com.github.captokie.scorestage.web.annotation.HtmlController;

@HtmlController
public class HomeHtmlCtrl {

    private static final String HOME_JSP = "home";

    @RequestMapping(value = { ReqMappings.INDEX, ReqMappings.HOME }, method = RequestMethod.GET)
    public String page() {
        return HOME_JSP;
    }
}
