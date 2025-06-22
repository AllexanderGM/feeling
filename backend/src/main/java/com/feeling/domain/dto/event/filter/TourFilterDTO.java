package com.feeling.domain.dto.event.filter;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TourFilterDTO {
    private List<String> tags; // Lista de tags seleccionados

}
