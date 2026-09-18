package com.expense.controller;

import org.springframework.web.bind.annotation.PostMapping;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expense.dto.LoginRequestDTO;
import com.expense.dto.UserResponseDTO;
import com.expense.entity.User;
import com.expense.security.JwtService;
import com.expense.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService,
                          JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO loginRequest) {

        User user = userService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        String token = jwtService.generateToken(user.getEmail());

        UserResponseDTO userDTO = userService.convertToDTO(user);

        return new LoginResponseDTO(token, userDTO);
    }

    // Login response DTO
    public static class LoginResponseDTO {

        private String token;
        private UserResponseDTO user;

        public LoginResponseDTO() {
        }

        public LoginResponseDTO(String token, UserResponseDTO user) {
            this.token = token;
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public UserResponseDTO getUser() {
            return user;
        }

        public void setUser(UserResponseDTO user) {
            this.user = user;
        }
    }
}