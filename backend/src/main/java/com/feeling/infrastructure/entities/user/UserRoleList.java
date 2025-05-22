package com.feeling.infrastructure.entities.user;

import java.util.Arrays;

public enum UserRoleList {
    ADMIN, CLIENT;

    public static UserRoleList lookup(String rol) {
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(rol))
                .findFirst()
                .orElse(CLIENT);
    }
}
