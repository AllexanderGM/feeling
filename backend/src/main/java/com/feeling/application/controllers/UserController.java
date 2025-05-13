package com.feeling.application.controllers;

import com.feeling.domain.dto.response.MessageResponseDTO;
import com.feeling.domain.dto.user.UserModifyDTO;
import com.feeling.domain.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{email}")
    public ResponseEntity<?> get(@PathVariable String email) {
        return ResponseEntity.ok(userService.get(email));
    }

    @GetMapping
    public ResponseEntity<?> getList() {
        return ResponseEntity.ok(userService.getList());
    }

    @PutMapping("/{email}")
    public ResponseEntity<?> update(@PathVariable String email, @RequestBody UserModifyDTO user) {
        return ResponseEntity.ok(userService.update(email, user));
    }

    @DeleteMapping("/{email}")
    public ResponseEntity<?> delete(@PathVariable String email) {
        return ResponseEntity.ok(userService.delete(email));
    }


    @PostMapping("/{id}/admin")
    public ResponseEntity<MessageResponseDTO> assignAdminRole(
            @RequestHeader("Super-Admin-Email") String superAdminEmail,
            @PathVariable String id) {

        MessageResponseDTO response = userService.grantAdminRole(superAdminEmail, id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<MessageResponseDTO> removeAdminRole(
            @RequestHeader("Super-Admin-Email") String superAdminEmail,
            @PathVariable String id) {

        MessageResponseDTO response = userService.revokeAdminRole(superAdminEmail, id);
        return ResponseEntity.ok(response);
    }
}
