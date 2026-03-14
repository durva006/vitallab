package com.vitallab.vitallab.controller;

import com.vitallab.vitallab.entity.Test;
import com.vitallab.vitallab.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private TestRepository testRepository;

    // Add new test
    @PostMapping("/add")
    public Test addTest(@RequestBody Test test) {
        return testRepository.save(test);
    }

    // Get all tests
    @GetMapping
    public List<Test> getAllTests() {
        return testRepository.findAll();
    }
}
