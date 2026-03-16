package com.example.backend.security; // Assuming this package name is correct in your setup

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    // Allow all localhost ports for development
                    .allowedOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:8080")
                    // 2. Allows all necessary HTTP methods (including OPTIONS for pre-flight).
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                    // 3. Allows all request headers, which is critical for sending the JWT in the 'Authorization' header.
                    .allowedHeaders("*") 
                    // 4. Allows the use of credentials (like Authorization headers, cookies).
                    .allowCredentials(true); 
            }

            @Override
            public void addResourceHandlers(org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry registry) {
                // Serve uploaded files from filesystem uploads/ directory at /uploads/**
                registry.addResourceHandler("/uploads/**")
                        .addResourceLocations("file:uploads/");
            }
        };
    }
}