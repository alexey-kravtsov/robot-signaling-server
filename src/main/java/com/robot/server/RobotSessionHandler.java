package com.robot.server;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

@Component
public class RobotSessionHandler extends AbstractWebSocketHandler {
    private final Logger logger = LogManager.getLogger(RobotSessionHandler.class);

    private final SessionsController sessionsController;

    @Autowired
    public RobotSessionHandler(SessionsController sessionsController) {
        this.sessionsController = sessionsController;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (!sessionsController.tryOpenRobotSession(session)) {
            session.close(new CloseStatus(2002, "Robot limit exceeded"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        logger.info("Message time: " + System.currentTimeMillis());
        logger.info("Signaling received from operator: " + message.getPayload());

        WebSocketSession operatorSession = sessionsController.getOperatorSession();
        if (operatorSession == null) {
            session.sendMessage(new TextMessage("error"));
            return;
        }

        operatorSession.sendMessage(message);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        sessionsController.closeRobotSession();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessionsController.closeRobotSession();
    }
}
