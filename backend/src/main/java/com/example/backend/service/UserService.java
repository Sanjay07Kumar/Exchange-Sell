package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepo;
import com.example.backend.security.JwtUtil;

@Service
public class UserService {
    @Autowired
    public UserRepo userRepo;

    @Autowired
    public JwtUtil jwtUtil;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public List<User> getallUsers() {
        return userRepo.findAll();
    }

    public Optional<User> findById(Long id) {
        if (id == null) {
            return Optional.empty();
        }
        return userRepo.findById(id);
    }


    public User findByEmail(String email) {
        return userRepo.findByEmail(email).orElse(null);
    }

    public String register(User user) {

        if (user == null || user.getEmail() == null && user.getPassword() == null) {
            return "Invalid Credentials";
        }

        if(userRepo.findByEmail(user.getEmail()).isPresent()) {
            return "Email Already Exists";
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return "Registration Successfull";
    }

    public String login(String email,String password) {
        
        Optional<User> userData=userRepo.findByEmail(email);
        if(userData.isEmpty()) {
            return "User Not Found";
        }
        User user=userData.get();
        if(!passwordEncoder.matches(password, user.getPassword())) {
            return "Wrong Password";
        }
        return "Login Successfull";
    }

    public String editUser(User user) {

        Optional<User> userData = userRepo.findByEmail(user.getEmail());

        if (userData.isEmpty()) {
            return "Error: User Not Found with email: " + user.getEmail();
        }

        User userUpdate = userData.get();

        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            userUpdate.setUsername(user.getUsername());
        }

        if (user.getEmail() != null && !user.getEmail().isEmpty()) {
            userUpdate.setEmail(user.getEmail());
        }

        if (user.getPhone() != null && !user.getPhone().isEmpty()) {
            userUpdate.setPhone(user.getPhone());
        }

        if (user.getProfilePhotoUrl() != null && !user.getProfilePhotoUrl().isEmpty()) {
            userUpdate.setProfilePhotoUrl(user.getProfilePhotoUrl());
        }

        if (user.getCity() != null && !user.getCity().isEmpty()) {
            userUpdate.setCity(user.getCity());
        }

        if (user.getState() != null && !user.getState().isEmpty()) {
            userUpdate.setState(user.getState());
        }

        // Update password if sent
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            userUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        try {
            userRepo.save(userUpdate);
            return "Success: User updated successfully for email: " + user.getEmail();
        } catch (Exception err) {
            return "Error: Failed to save user. Reason: " + err.getMessage();
        }
    }

    public String deleteUser(Long id, String token) {

    // 1. Check if user exists
    Optional<User> optionalUser = userRepo.findById(id);
    if (optionalUser.isEmpty()) {
        return "Error: User not found.";
    }

    // 2. Extract logged-in email from JWT
    String email;
    try {
        email = jwtUtil.extractUsername(token);
    } catch (Exception e) {
        return "Error: Invalid Token.";
    }

    User loggedIn = userRepo.findByEmail(email).orElse(null);
    if (loggedIn == null) {
        return "Error: Unauthorized. User not found from token.";
    }

    // 3. Prevent deleting other users
    if (loggedIn.getId()!=id) {
        return "Error: You are NOT allowed to delete another user's account.";
    }

    // 4. Delete the user
    try {
        userRepo.deleteById(id);
        return "Success: User Deleted Successfully";
    } catch (Exception e) {
        return "Error: Failed to delete User. Reason: " + e.getMessage();
    }
}

}