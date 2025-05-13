package com.feeling.infrastructure.validators;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDateTime;

public class DateInFutureValidator implements ConstraintValidator<DateInFuture, LocalDateTime> {
    @Override
    public boolean isValid(LocalDateTime value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Dejar que @NotNull maneje el caso de null
        }
        return value.isAfter(LocalDateTime.now());
    }
}
