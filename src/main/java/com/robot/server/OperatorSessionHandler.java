package com.robot.server;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;

@Slf4j
@Component
public class OperatorSessionHandler extends AbstractWebSocketHandler {

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
        log.info("Message time: " + System.currentTimeMillis());
        log.info("Signaling received from robot: " + message.getPayload());

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
