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
public class OperatorSessionHandler extends AbstractWebSocketHandler {
    private final Logger logger = LogManager.getLogger(OperatorSessionHandler.class);

    private final SessionsController sessionsController;

    @Autowired
    public OperatorSessionHandler(SessionsController sessionsController) {
        this.sessionsController = sessionsController;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        if (!sessionsController.tryOpenOperatorSession(session)) {
            session.close(new CloseStatus(2001, "Client limit exceeded"));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        logger.info("Message time: " + System.currentTimeMillis());
        logger.info("Signaling received from robot: " + message.getPayload());

        WebSocketSession robotSession = sessionsController.getRobotSession();
        if (robotSession == null) {
            session.sendMessage(new TextMessage("error"));
            return;
        }

        robotSession.sendMessage(message);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        sessionsController.closeOperatorSession();
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessionsController.closeOperatorSession();
    }
}
