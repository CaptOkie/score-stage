package com.github.captokie.scorestage.web.ctrl;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import com.github.captokie.scorestage.web.Jsps;
import com.github.captokie.scorestage.web.ReqMappings;
import com.github.captokie.scorestage.web.annotation.HtmlController;

@HtmlController
public class MusicScoreHtmlCtrl {

    @RequestMapping(value = ReqMappings.MUSIC_SCORE, method = RequestMethod.GET)
    public String page() {
        return Jsps.MUSIC_SCORE;
    }
}
