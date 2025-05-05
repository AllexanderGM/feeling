package com.tours.infrastructure.entities.user;

import java.util.Arrays;

public enum UserRol {
    ADMIN, CLIENT;

    public static UserRol lookup(String rol) {
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(rol))
                .findFirst()
                .orElse(CLIENT);
    }
}
