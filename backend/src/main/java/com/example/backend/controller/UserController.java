package com.example.backend.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.LoginRequestDTO;
import com.example.backend.dto.LoginResponse;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.web.bind.annotation.PutMapping;

import com.example.backend.security.JwtUtil;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    public UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;


    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            return ResponseEntity.ok(userService.getallUsers());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
       String result=userService.register(user);

        if ("Registration Successfull".equals(result)) {
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } else if ("Invalid Credentials".equals(result)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
        }
    }                                          
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
    try {
        User user = userService.findByEmail(loginRequest.getEmail());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User Not Found");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Wrong Password");
        }

        // GENERATE JWT TOKEN
        String token = jwtUtil.generateToken(user.getEmail());

        // Return token + user info if needed
        return ResponseEntity.ok(new LoginResponse(user.getId(),token ));

    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
    }
}

    

    @PutMapping("/update")
    public ResponseEntity<String> updateUser(@RequestBody User user) {
        try {
            String result=userService.editUser(user);
             
            if(result.startsWith("Success")) {
                return ResponseEntity.ok(result);
            }
            else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
            }
        }
        catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error : Unexpected failure - "+ e.getMessage());
        }
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {

        Optional<User> userData = userService.findById(id);

        if (userData.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("User not found with id: " + id);
        }

        return ResponseEntity.ok(userData.get());
    }
    
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {

        // Extract token from "Bearer <token>"
        String token = authHeader.replace("Bearer ", "");

        String result = userService.deleteUser(id, token);

        if (result.startsWith("Success")) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

}