package com.robot.server;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

@Component
public class SessionsController {
    private Logger logger =  LogManager.getLogger(SessionsController.class);

    private WebSocketSession operatorSession;
    private WebSocketSession robotSession;

    public synchronized boolean tryOpenOperatorSession(WebSocketSession socketSession) {
        if (operatorSession != null) {
            return false;
        }

        operatorSession = socketSession;
        return true;
    }

    public synchronized boolean tryOpenRobotSession(WebSocketSession socketSession) {
        if (robotSession != null) {
            return false;
        }

        robotSession = socketSession;
        return true;
    }

    public synchronized WebSocketSession getOperatorSession() {
        return operatorSession;
    }

    public synchronized WebSocketSession getRobotSession() {
        return robotSession;
    }

    public synchronized void closeOperatorSession() {
        if (operatorSession == null) {
            return;
        }

        try {
            operatorSession.close();
        } catch (IOException e) {
            logger.error(e);
        } finally {
            operatorSession = null;
        }
    }

    public synchronized void closeRobotSession() {
        if (robotSession == null) {
            return;
        }

        try {
            robotSession.close();
        } catch (IOException e) {
            logger.error(e);
        } finally {
            robotSession = null;
        }
    }
}
