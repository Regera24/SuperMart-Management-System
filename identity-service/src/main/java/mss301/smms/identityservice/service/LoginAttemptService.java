package mss301.smms.identityservice.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Tracks failed login attempts in memory.
 * Locks an account after 5 failures within 15 minutes.
 * NOTE: For multi-instance deployments, replace with Redis-backed solution.
 */
@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MILLIS = 15 * 60 * 1000L; // 15 minutes

    private record AttemptRecord(AtomicInteger count, Instant windowStart) {}

    private final ConcurrentHashMap<String, AttemptRecord> attempts = new ConcurrentHashMap<>();

    public void loginSucceeded(String username) {
        attempts.remove(username);
    }

    public void loginFailed(String username) {
        attempts.compute(username, (key, record) -> {
            Instant now = Instant.now();
            if (record == null || now.isAfter(record.windowStart().plusMillis(WINDOW_MILLIS))) {
                return new AttemptRecord(new AtomicInteger(1), now);
            }
            record.count().incrementAndGet();
            return record;
        });
    }

    public boolean isBlocked(String username) {
        AttemptRecord record = attempts.get(username);
        if (record == null) return false;
        if (Instant.now().isAfter(record.windowStart().plusMillis(WINDOW_MILLIS))) {
            attempts.remove(username);
            return false;
        }
        return record.count().get() >= MAX_ATTEMPTS;
    }
}
