package com.tours.domain.dto.tour;

import java.util.List;

public record CountryRequestDTO(String region, String name, List<String> phone, String image) {
}
