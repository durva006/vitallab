package com.vitallab.vitallab.repository;

import com.vitallab.vitallab.entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Test, Long> {
}
