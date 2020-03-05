package com.robot.server.ws;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final OperatorSessionHandler operatorSessionHandler;
    private final RobotSessionHandler robotSessionHandler;

    @Autowired
    public WebSocketConfig(
            OperatorSessionHandler operatorSessionHandler,
            RobotSessionHandler robotSessionHandler) {
        this.operatorSessionHandler = operatorSessionHandler;
        this.robotSessionHandler = robotSessionHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(operatorSessionHandler, "/signaling/operator").setAllowedOrigins("*");
        registry.addHandler(robotSessionHandler, "/signaling/robot").setAllowedOrigins("*");
    }
}