package com.example.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // PUBLIC ENDPOINTS - explicitly allow
                .requestMatchers("/user/login").permitAll()
                .requestMatchers("/user/register").permitAll()
                // GET requests for items and categories are public
                .requestMatchers(HttpMethod.GET, "/items/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()
                // Allow unauthenticated access to uploaded images and public static assets
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/placeholder.png").permitAll()
                .requestMatchers("/").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers("/ws/**").permitAll()
                // POST/PUT/DELETE requests need authentication
                .requestMatchers(HttpMethod.POST, "/items/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/wishlist/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/wishlist/**").authenticated()
                
                .requestMatchers(HttpMethod.GET, "/wishlist/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/items/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/items/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/categories/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/categories/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/categories/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/user/profile").authenticated()
                .requestMatchers(HttpMethod.PUT, "/user/update").authenticated()
                // Everything else needs authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
