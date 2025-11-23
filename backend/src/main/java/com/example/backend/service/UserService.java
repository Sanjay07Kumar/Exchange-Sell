package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepo;

@Service
public class UserService {
    @Autowired
    public UserRepo userRepo;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    public List<User> getallUsers() {
        return userRepo.findAll();
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

        // Update only if value provided
        if (user.getUsername() != null && !user.getUsername().isEmpty()) {
            userUpdate.setUsername(user.getUsername());
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
}