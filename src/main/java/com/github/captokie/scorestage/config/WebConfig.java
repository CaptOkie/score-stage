package com.github.captokie.scorestage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.JstlView;

@Configuration
@EnableWebMvc
public class WebConfig extends WebMvcConfigurerAdapter {

    @Override
    public void configureViewResolvers(final ViewResolverRegistry registry) {
        registry.jsp("/WEB-INF/jsp/", ".jsp").viewClass(JstlView.class);
    }
}
