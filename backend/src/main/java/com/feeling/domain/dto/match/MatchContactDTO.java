package com.feeling.domain.dto.match;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchContactDTO {
    private String email;
    private String whatsapp;
    private String phoneNumber;
}