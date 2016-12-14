package com.github.captokie.scorestage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import com.github.captokie.scorestage.web.ReqMappings;
import com.github.captokie.scorestage.web.ReqParams;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(final AuthenticationManagerBuilder auth) throws Exception {
        // @formatter:off
        auth.inMemoryAuthentication()
                .withUser("test").password("test").roles();
        // @formatter:on
    }

    @Override
    protected void configure(final HttpSecurity http) throws Exception {
        // @formatter:off
        http.authorizeRequests()
                .antMatchers(HttpMethod.GET, ReqMappings.RESOURCES + "/**").permitAll()
                .antMatchers(ReqMappings.LOGIN).anonymous()
                .anyRequest().authenticated()
                .and()
            .formLogin()
                .defaultSuccessUrl(ReqMappings.INDEX)
                .failureUrl(ReqMappings.LOGIN)
                .loginPage(ReqMappings.LOGIN)
                .loginProcessingUrl(ReqMappings.LOGIN)
                .passwordParameter(ReqParams.USERNAME)
                .usernameParameter(ReqParams.USERNAME)
                .and()
            .logout()
                .logoutSuccessUrl(ReqMappings.LOGIN)
                .logoutUrl(ReqMappings.LOGOUT);
        // @formatter:on
    }
}
