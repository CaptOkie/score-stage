package com.github.captokie.scorestage.config;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewResolverRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.view.JstlView;

import com.github.captokie.scorestage.web.ReqMappings;
import com.github.captokie.scorestage.web.ReqParams;

@Configuration
@EnableWebMvc
public class WebConfig extends WebMvcConfigurerAdapter {

    @Override
    public void configureViewResolvers(final ViewResolverRegistry registry) {
        final Map<String, Object> attributes = getConstants(ReqMappings.class, ReqParams.class);
        registry.jsp("/WEB-INF/jsp/", ".jsp").viewClass(JstlView.class).attributes(Collections.unmodifiableMap(attributes));
    }

    @Override
    public void addResourceHandlers(final ResourceHandlerRegistry registry) {
        registry.addResourceHandler(ReqMappings.RESOURCES + "/**").addResourceLocations("/resources/", "/bower_components/");
    }

    private static Map<String, Object> getConstants(final Class<?>... classes) {
        final Map<String, Object> map = new HashMap<>();
        for (final Class<?> clazz : classes) {
            map.put(clazz.getSimpleName(), getConstantsMap(clazz));
        }
        return map;
    }

    private static Map<String, Object> getConstantsMap(final Class<?> clazz) {
        try {
            final Map<String, Object> map = new HashMap<>();
            for (final Field field : clazz.getDeclaredFields()) {
                final int mod = field.getModifiers();
                if (Modifier.isFinal(mod) && Modifier.isPublic(mod) && Modifier.isStatic(mod)) {
                    map.put(field.getName(), field.get(null));
                }
            }
            return Collections.unmodifiableMap(map);
        }
        catch (final IllegalArgumentException | IllegalAccessException e) {
            // Should never happen, so fail if it does
            throw new RuntimeException(e);
        }
    }
}
