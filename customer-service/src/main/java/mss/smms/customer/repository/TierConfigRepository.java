package mss.smms.customer.repository;

import mss.smms.customer.entity.TierConfig;
import mss.smms.customer.enums.TierLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TierConfigRepository extends JpaRepository<TierConfig, Long> {

    Optional<TierConfig> findByTierLevel(TierLevel tierLevel);

    List<TierConfig> findAllByOrderByMinPointsAsc();

    List<TierConfig> findByIsActiveTrueOrderByMinPointsAsc();
}
