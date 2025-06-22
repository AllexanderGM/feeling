package com.feeling.domain.dto.event;

import java.util.List;

public record CountryRequestDTO(String region, String name, List<String> phone, String image) {
}
