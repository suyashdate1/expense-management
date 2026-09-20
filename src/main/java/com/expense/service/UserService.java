
package com.expense.service;

import java.util.List;

import com.expense.exception.EmailAlreadyExistsException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.expense.dto.UserResponseDTO;
import com.expense.entity.User;
import com.expense.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

    }

    // CREATE
    public User createUser(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {

            throw new EmailAlreadyExistsException(
                    "Email already registered"
            );

        }

        user.setPassword(
                passwordEncoder.encode(user.getPassword())
        );

        return userRepository.save(user);

    }

    // READ ALL
    public List<User> getAllUsers() {

        return userRepository.findAll();

    }

    // READ ONE
    public User getUserById(Long id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

    }

    // GET USER BY EMAIL
    public User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

    }

    // UPDATE CURRENT LOGGED-IN USER PROFILE
    public User updateProfile(String currentEmail,
                              User userDetails) {

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Update name
        if (userDetails.getName() != null &&
            !userDetails.getName().trim().isEmpty()) {

            user.setName(
                    userDetails.getName().trim()
            );

        }

        // Update email
        String newEmail = userDetails.getEmail();

        if (newEmail != null &&
            !newEmail.trim().isEmpty() &&
            !newEmail.equals(currentEmail)) {

            if (userRepository.findByEmail(newEmail).isPresent()) {

                throw new EmailAlreadyExistsException(
                        "Email already registered"
                );

            }

            user.setEmail(
                    newEmail.trim()
            );

        }

        return userRepository.save(user);

    }

    // CHANGE PASSWORD
    public void changePassword(String currentEmail,
                               String currentPassword,
                               String newPassword,
                               String confirmPassword) {

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(
                currentPassword,
                user.getPassword())) {

            throw new RuntimeException(
                    "Current password is incorrect"
            );

        }

        // Check new password confirmation
        if (!newPassword.equals(confirmPassword)) {

            throw new RuntimeException(
                    "New passwords do not match"
            );

        }

        // Validate new password length
        if (newPassword.length() < 6) {

            throw new RuntimeException(
                    "New password must be at least 6 characters"
            );

        }

        // Prevent using the same password
        if (passwordEncoder.matches(
                newPassword,
                user.getPassword())) {

            throw new RuntimeException(
                    "New password must be different from current password"
            );

        }

        // Encrypt and save new password
        user.setPassword(
                passwordEncoder.encode(newPassword)
        );

        userRepository.save(user);

    }

    // UPDATE USER BY ID
    public User updateUser(Long id,
                           User userDetails) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        user.setName(userDetails.getName());

        user.setEmail(userDetails.getEmail());

        // Encrypt new password before updating
        if (userDetails.getPassword() != null &&
            !userDetails.getPassword().isEmpty()) {

            user.setPassword(
                    passwordEncoder.encode(
                            userDetails.getPassword()
                    )
            );

        }

        return userRepository.save(user);

    }

    // DELETE
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        userRepository.delete(user);

    }

    // LOGIN
    public User login(String email,
                      String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        ));

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid email or password"
            );

        }

        return user;

    }

    // CONVERT TO DTO
    public UserResponseDTO convertToDTO(User user) {

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail()
        );

    }

}

