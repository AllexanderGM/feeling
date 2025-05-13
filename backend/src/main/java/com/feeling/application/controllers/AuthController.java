package com.feeling.application.controllers;

import com.feeling.domain.dto.auth.AuthRequestDTO;
import com.feeling.domain.dto.auth.AuthVerifyCodeDTO;
import com.feeling.domain.dto.user.UserRequestDTO;
import com.feeling.domain.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRequestDTO newUser) {
        Object data = authService.register(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }

    @PostMapping("/registerGoogle")
    public ResponseEntity<?> registerGoogle(@Valid @RequestBody UserRequestDTO newUser) {
        Object data = authService.register(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO user) {
        return ResponseEntity.ok(authService.login(user));
    }

    @PostMapping("/loginGoogle")
    public ResponseEntity<?> loginGoogle(@RequestBody AuthRequestDTO user) {
        return ResponseEntity.ok(authService.login(user));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestParam String user) throws BadRequestException {
        return ResponseEntity.ok(authService.refreshToken(user));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyCode(@Valid @RequestBody AuthVerifyCodeDTO authVerifyCodeDTO) {
        return ResponseEntity.ok(authService.verifyCode(authVerifyCodeDTO));
    }

    @PostMapping("/resend")
    public ResponseEntity<?> resendCode(@RequestParam String email) {
        return ResponseEntity.ok(authService.resendCode(email));
    }
}
