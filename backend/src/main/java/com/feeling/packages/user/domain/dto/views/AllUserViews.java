package com.feeling.packages.user.domain.dto.views;

import com.fasterxml.jackson.annotation.JsonView;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Meta-anotación para aplicar todas las vistas a la vez.
 * <p>
 * Usar @AllUserViews cuando un campo debe estar visible en todas las vistas
 * (Public, Internal, Suggestions, Matched, Basic, Metrics)
 */
@Target({ElementType.METHOD, ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@JsonView({
    UserViews.Public.class,
    UserViews.Internal.class,
    UserViews.Suggestions.class,
    UserViews.Matched.class,
})
public @interface AllUserViews {
}
