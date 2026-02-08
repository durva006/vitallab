package com.vitallab.vitallab.controller;

import java.util.Map;
import com.vitallab.vitallab.entity.Booking;
import com.vitallab.vitallab.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody Booking booking) {
        Booking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(Map.of(
            "receiptId", saved.getId(),
            "message", "Booking created"
        ));
    }

    @GetMapping("/all")
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/user/{id}")
public List<Booking> getUserBookings(@PathVariable Long id) {
    return bookingRepository.findByUserId(id);
}


}

