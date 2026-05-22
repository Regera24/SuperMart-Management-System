package mss.smms.customer.repository;

import mss.smms.customer.entity.LoyaltyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoyaltyRuleRepository extends JpaRepository<LoyaltyRule, Long> {
    /**
     * Find active rules that are currently valid, ordered by priority (highest first).
     */
    List<LoyaltyRule> findByIsActiveTrueOrderByPriorityDesc();
}
