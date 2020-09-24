package com.robot.server.ws;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

@Slf4j
@Component
public class RobotSessionHandler extends AbstractWebSocketHandler {

    private final SessionsRegistry sessionsRegistry;

    @Autowired
    public RobotSessionHandler(SessionsRegistry sessionsRegistry) {
        this.sessionsRegistry = sessionsRegistry;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (!sessionsRegistry.tryOpenRobotSession(session)) {
            session.close(new CloseStatus(2002, "Robot limit exceeded"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        if ("PING".equals(message.getPayload())) {
            return;
        }

        log.info("Signaling received from robot at " + System.currentTimeMillis());

        WebSocketSession operatorSession = sessionsRegistry.getOperatorSession();
        if (operatorSession == null) {
            session.sendMessage(new TextMessage("{\"type\": \"error\", \"data\": \"No operator connection\"}"));
            return;
        }

        operatorSession.sendMessage(message);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        sessionsRegistry.closeRobotSession();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessionsRegistry.closeRobotSession();
    }
}
