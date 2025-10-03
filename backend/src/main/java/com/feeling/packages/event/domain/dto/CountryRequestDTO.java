package com.feeling.packages.event.domain.dto;

import java.util.List;

public record CountryRequestDTO(String region, String name, List<String> phone, String image) {
}
