package com.example.backend.dto;

import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Getter;

@Getter
@Setter
@NoArgsConstructor
public class LoginResponse {

    private String token;
    private Long id;
    public LoginResponse(Long id,String token) {
        this.token = token;
        this.id=id;
    }
    
}
