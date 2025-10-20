package com.feeling.packages.match.domain.dto;

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
    private String phoneCode;
}
