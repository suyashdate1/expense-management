
package com.expense.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expense.dto.ChangePasswordRequest;
import com.expense.dto.UserResponseDTO;
import com.expense.entity.User;
import com.expense.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {

        this.userService = userService;

    }

    // CREATE
    @PostMapping
    public UserResponseDTO createUser(@Valid @RequestBody User user) {

        User savedUser = userService.createUser(user);

        return userService.convertToDTO(savedUser);

    }

    // READ ALL
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {

        return userService.getAllUsers()
                .stream()
                .map(userService::convertToDTO)
                .toList();

    }

    // CURRENT LOGGED-IN USER PROFILE
    @GetMapping("/profile")
    public UserResponseDTO getProfile(Authentication authentication) {

        String email = authentication.getName();

        User user = userService.getUserByEmail(email);

        return userService.convertToDTO(user);

    }

    // UPDATE CURRENT LOGGED-IN USER PROFILE
    @PutMapping("/profile")
    public UserResponseDTO updateProfile(
            @RequestBody User userDetails,
            Authentication authentication) {

        String currentEmail = authentication.getName();

        User updatedUser =
                userService.updateProfile(currentEmail, userDetails);

        return userService.convertToDTO(updatedUser);

    }

    // READ ONE
    // Only numeric IDs are accepted here.
    @GetMapping("/{id:\\d+}")
    public UserResponseDTO getUserById(@PathVariable Long id) {

        User user = userService.getUserById(id);

        return userService.convertToDTO(user);

    }

    // UPDATE USER BY ID
    // Only numeric IDs are accepted here.
    @PutMapping("/{id:\\d+}")
    public UserResponseDTO updateUser(
            @PathVariable Long id,
            @RequestBody User user) {

        User updatedUser =
                userService.updateUser(id, user);

        return userService.convertToDTO(updatedUser);

    }

    // DELETE
    // Only numeric IDs are accepted here.
    @DeleteMapping("/{id:\\d+}")
    public String deleteUser(@PathVariable Long id) {

        userService.deleteUser(id);

        return "User deleted successfully";

    }
    
    
 // CHANGE PASSWORD
    @PutMapping("/change-password")
    public String changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        String currentEmail = authentication.getName();

        userService.changePassword(
                currentEmail,
                request.getCurrentPassword(),
                request.getNewPassword(),
                request.getConfirmPassword()
        );

        return "Password changed successfully";
    }

}

