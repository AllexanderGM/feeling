package com.feeling.infrastructure.entities.tour;

import lombok.Getter;

import java.util.Arrays;

@Getter
public enum TagTourOptions {
    VACATION("Vacaciones", "Experiencias de descanso y recreación"),
    ECOTOURISM("Ecoturismo", "Turismo en contacto con la naturaleza"),
    LUXURY("Lujo", "Experiencias premium y exclusivas"),
    ADVENTURE("Aventura", "Actividades emocionantes y extremas"),
    ADRENALIN("Adrenalina", "Experiencias con alta intensidad y riesgo"),
    BEACH("Playa", "Destinos con sol, arena y mar"),
    MOUNTAIN("Montaña", "Excursiones y exploraciones en montañas"),
    CRUISE("Crucero", "Viajes en barcos con experiencias turísticas"),
    CITY("Ciudad", "Turismo en zonas urbanas");

    private final String displayName;
    private final String description;

    // Constructor
    TagTourOptions(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    // Método para buscar por nombre o displayName
    public static TagTourOptions lookup(String value) {
        return Arrays.stream(values())
                .filter(tag -> tag.name().equalsIgnoreCase(value) || tag.displayName.equalsIgnoreCase(value))
                .findFirst()
                .orElse(VACATION);
    }
}
