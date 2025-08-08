package com.feeling.infrastructure.entities.user;

import java.util.Arrays;

public enum UserApprovalStatusList {
    PENDING,    // Usuario pendiente de aprobación
    APPROVED,   // Usuario aprobado 
    REJECTED;   // Usuario rechazado/desaprobado

    public static UserApprovalStatusList lookup(String status) {
        return Arrays.stream(values())
                .filter(s -> s.name().equalsIgnoreCase(status))
                .findFirst()
                .orElse(PENDING);
    }
    
    public boolean isPending() {
        return this == PENDING;
    }
    
    public boolean isApproved() {
        return this == APPROVED;
    }
    
    public boolean isRejected() {
        return this == REJECTED;
    }
}