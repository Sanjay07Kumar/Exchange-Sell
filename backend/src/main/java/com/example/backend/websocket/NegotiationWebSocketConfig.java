package com.example.backend.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class NegotiationWebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private NegotiationSocketHandler negotiationSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(negotiationSocketHandler, "/ws/chat")
                .setAllowedOriginPatterns("*");
    }
}
