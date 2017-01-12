package com.github.captokie.scorestage.web.ctrl;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.github.captokie.scorestage.web.Jsps;
import com.github.captokie.scorestage.web.ReqMappings;
import com.github.captokie.scorestage.web.annotation.HtmlController;

@HtmlController
public class HomeHtmlCtrl {

    @RequestMapping(value = { ReqMappings.INDEX, ReqMappings.HOME }, method = RequestMethod.GET)
    public String page() {
        return Jsps.HOME;
    }
}