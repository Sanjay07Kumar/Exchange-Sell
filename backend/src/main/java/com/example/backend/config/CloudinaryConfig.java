package com.example.backend.config;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {

        Map<String, String> config = new HashMap<>();

        config.put("cloud_name", "dd5mz9wnj");
        config.put("api_key", "473818984276267");
        config.put("api_secret", "nh0CCFKvulC6RD5iVcWsqbvJJkY");

        return new Cloudinary(config);
    }
}