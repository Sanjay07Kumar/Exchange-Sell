package com.example.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(jwtUtil, userDetailsService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .authorizeHttpRequests(auth -> auth
                // PUBLIC ENDPOINTS - explicitly allow
                .requestMatchers("/user/login").permitAll()
                .requestMatchers("/user/register").permitAll()
                // GET requests for items and categories are public
                .requestMatchers("GET", "/items/**").permitAll()
                .requestMatchers("GET", "/categories/**").permitAll()
                // Allow unauthenticated access to uploaded images and public static assets
                .requestMatchers("GET", "/uploads/**").permitAll()
                .requestMatchers("GET", "/placeholder.png").permitAll()
                // POST/PUT/DELETE requests need authentication
                .requestMatchers("POST", "/items/**").authenticated()
                .requestMatchers("POST", "/wishlist/**").authenticated()
                .requestMatchers("DELETE", "/wishlist/**").authenticated()
                
                .requestMatchers("GET", "/wishlist/**").authenticated()
                .requestMatchers("PUT", "/items/**").authenticated()
                .requestMatchers("DELETE", "/items/**").authenticated()
                .requestMatchers("POST", "/categories/**").authenticated()
                .requestMatchers("PUT", "/categories/**").authenticated()
                .requestMatchers("DELETE", "/categories/**").authenticated()
                .requestMatchers("GET", "/user/profile").authenticated()
                .requestMatchers("PUT", "/user/update").authenticated()
                // Everything else needs authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
