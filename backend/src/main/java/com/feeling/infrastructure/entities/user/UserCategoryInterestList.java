package com.feeling.infrastructure.entities.user;

import java.util.Arrays;

public enum UserCategoryInterestList {
    SINGLES, ROUSE, SPIRIT;

    public static UserCategoryInterestList lookup(String userCategoryInterest) {
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(userCategoryInterest))
                .findFirst()
                .orElse(SINGLES);
    }
}
