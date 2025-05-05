package com.tours.infrastructure.entities.booking;

import java.util.Arrays;

public enum AccommodationBooking {
    SINGLE("Sencilla"),
    DOUBLE("doble"),
    TRIPLE("triple"),
    QUADRUPLE("Cuádruple");

    private final String displayName;

    // Constructor
    AccommodationBooking(String displayName) {
        this.displayName = displayName;
    }

    // Buscar por nombre o displayName
    public static AccommodationBooking lookup(String value) {
        return Arrays.stream(values())
                .filter(tag -> tag.name().equalsIgnoreCase(value) || tag.displayName.equalsIgnoreCase(value))
                .findFirst()
                .orElse(SINGLE);
    }
}
