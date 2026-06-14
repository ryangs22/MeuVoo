/*
 * Flight.java
 *
 * Entidade que representa um voo no sistema. Contém informações de rota,
 * datas, horários, companhia aérea, preço, classe e assentos disponíveis.
 * Relaciona-se com a entidade Seat para gerenciar o mapa de assentos.
 * * PADRÃO CRIACIONAL APLICADO: Builder (através da classe interna FlightBuilder)
 */

package com.decolar.sistema_voos.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Flight {

    @Id
    private String id;

    @Column(name = "origin_airport", nullable = false)
    private String from;

    @Column(name = "destination_airport", nullable = false)
    private String to;

    @Column(name = "flight_date", nullable = false)
    private LocalDate date;

    @Column(name = "departure_time")
    private LocalTime departure;

    private String airline;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private FlightClass flightClass;

    private Integer availableSeats;

    @OneToMany(mappedBy = "flight", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Seat> seats = new ArrayList<>();

    // Construtor vazio obrigatório para o JPA/Hibernate
    public Flight() {}

    // Construtor privado: agora a única forma de criar um Voo com parâmetros é usando o Builder!
    private Flight(FlightBuilder builder) {
        this.id = builder.id;
        this.from = builder.from;
        this.to = builder.to;
        this.date = builder.date;
        this.departure = builder.departure;
        this.airline = builder.airline;
        this.price = builder.price;
        this.flightClass = builder.flightClass;
        this.availableSeats = builder.availableSeats;
    }

    // Getters e Setters padrão (mantidos para o Spring Data funcionar corretamente)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getDeparture() { return departure; }
    public void setDeparture(LocalTime departure) { this.departure = departure; }
    public String getAirline() { return airline; }
    public void setAirline(String airline) { this.airline = airline; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public FlightClass getFlightClass() { return flightClass; }
    public void setFlightClass(FlightClass flightClass) { this.flightClass = flightClass; }
    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }
    public List<Seat> getSeats() { return seats; }
    public void setSeats(List<Seat> seats) { this.seats = seats; }

    // =========================================================
    // INÍCIO DO PADRÃO BUILDER
    // =========================================================
    public static class FlightBuilder {
        private String id;
        private String from;
        private String to;
        private LocalDate date;
        private LocalTime departure;
        private String airline;
        private BigDecimal price;
        private FlightClass flightClass;
        private Integer availableSeats;

        public FlightBuilder id(String id) {
            this.id = id;
            return this;
        }

        public FlightBuilder from(String from) {
            this.from = from;
            return this;
        }

        public FlightBuilder to(String to) {
            this.to = to;
            return this;
        }

        public FlightBuilder date(LocalDate date) {
            this.date = date;
            return this;
        }

        public FlightBuilder departure(LocalTime departure) {
            this.departure = departure;
            return this;
        }

        public FlightBuilder airline(String airline) {
            this.airline = airline;
            return this;
        }

        public FlightBuilder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public FlightBuilder flightClass(FlightClass flightClass) {
            this.flightClass = flightClass;
            return this;
        }

        public FlightBuilder availableSeats(Integer availableSeats) {
            this.availableSeats = availableSeats;
            return this;
        }

        public Flight build() {
            return new Flight(this);
        }
    }
}