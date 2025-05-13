package com.feeling.infrastructure.validators;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = DateInFutureValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface DateInFuture {
    String message() default "La fecha debe ser en el futuro";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
