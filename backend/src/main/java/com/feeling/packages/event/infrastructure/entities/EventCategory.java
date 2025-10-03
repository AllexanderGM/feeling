package com.feeling.packages.event.infrastructure.entities;

public enum EventCategory {
    CULTURAL("Cultural"),
    DEPORTIVO("Deportivo"),
    MUSICAL("Musical"),
    SOCIAL("Social");

    private final String displayName;

    EventCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}