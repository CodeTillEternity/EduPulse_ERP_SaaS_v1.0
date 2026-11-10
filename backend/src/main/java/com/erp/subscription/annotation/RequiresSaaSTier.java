package com.erp.subscription.annotation;

import com.erp.subscription.model.SaaSTier;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Inherited;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation restricting access to endpoints and service methods based on the current tenant's
 * active SaaS subscription tier in the Central Tenant Registry.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface RequiresSaaSTier {
    SaaSTier value() default SaaSTier.ENTERPRISE;
}
