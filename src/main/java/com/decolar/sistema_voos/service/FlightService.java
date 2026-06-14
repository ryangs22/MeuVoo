/*
 * FlightService.java
 *
 * Serviço responsável pela lógica de negócio relacionada a voos.
 * Oferece métodos para busca por rota (com fallback para datas próximas),
 * recomendação por orçamento e população inicial do banco de dados.
 * PADRÃO CRIACIONAL APLICADO: O DataLoader agora utiliza o FlightBuilder para gerar os dados mockados.
 */

package com.decolar.sistema_voos.service;

import com.decolar.sistema_voos.entity.Flight;
import com.decolar.sistema_voos.entity.FlightClass;
import com.decolar.sistema_voos.entity.Seat;
import com.decolar.sistema_voos.repository.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FlightService {

    @Autowired
    private FlightRepository flightRepository;

    public List<Flight> searchFlights(String from, String to, LocalDate date,
                                      int passengers, FlightClass flightClass) {
        List<Flight> exactFlights = flightRepository.findAvailableFlights(from, to, date, flightClass, passengers);
        if (!exactFlights.isEmpty()) {
            return exactFlights;
        }

        LocalDate startDate = date.minusDays(7);
        LocalDate endDate = date.plusDays(7);
        List<Flight> nearbyFlights = flightRepository.findFlightsInDateRange(from, to, startDate, endDate, flightClass, passengers);
        nearbyFlights.sort(Comparator.comparingLong(f -> Math.abs(ChronoUnit.DAYS.between(date, f.getDate()))));
        return nearbyFlights;
    }

    public List<Flight> recommendByBudget(String from, BigDecimal maxPrice, int passengers) {
        List<Flight> allFlights = flightRepository.findByFromAndPriceLessThanEqual(from, maxPrice, passengers);
        if (allFlights.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Flight> bestByDestination = allFlights.stream()
                .collect(Collectors.toMap(
                        Flight::getTo,
                        f -> f,
                        (existing, replacement) ->
                                existing.getPrice().compareTo(replacement.getPrice()) >= 0 ? existing : replacement
                ));

        List<Flight> recommendations = new ArrayList<>(bestByDestination.values());
        recommendations.sort((f1, f2) -> f2.getPrice().compareTo(f1.getPrice()));
        return recommendations.stream().limit(3).collect(Collectors.toList());
    }

    public void populateSampleData() {
        if (flightRepository.count() > 0) {
            System.out.println(">>> Banco já contém dados. Pulando população.");
            return;
        }

        Map<String, Integer> distancias = new HashMap<>();
        distancias.put("GRU-GIG", 360);   distancias.put("GRU-REC", 2100);
        distancias.put("GRU-SSA", 1450);  distancias.put("GRU-POA", 850);
        distancias.put("GRU-CWB", 400);   distancias.put("GRU-FOR", 2350);
        distancias.put("GRU-MAO", 2700);  distancias.put("GRU-SCL", 2600);
        distancias.put("GRU-EZE", 1700);  distancias.put("GRU-MIA", 6500);
        distancias.put("CGH-SDU", 360);   distancias.put("CGH-REC", 2100);
        distancias.put("BSB-GIG", 920);   distancias.put("BSB-SSA", 1050);
        distancias.put("GIG-SSA", 1200);  distancias.put("GIG-REC", 1850);
        distancias.put("REC-FOR", 630);   distancias.put("SSA-REC", 680);
        distancias.put("POA-CWB", 530);   distancias.put("CWB-GIG", 670);
        distancias.put("EZE-SCL", 1140);  distancias.put("MIA-JFK", 1750);
        distancias.put("SCL-LIM", 3300);  distancias.put("LIS-LHR", 1600);
        distancias.put("LHR-CDG", 340);   distancias.put("CDG-FCO", 1100);

        List<String> internacionaisList = Arrays.asList(
                "SCL", "EZE", "MIA", "JFK", "LIS", "LHR", "CDG", "MAD", "AMS", "FRA", "MXP", "DXB", "DOH", "NRT", "ICN", "SIN",
                "FCO", "ZRH", "IST", "VIE", "MUC", "ATH", "BCN", "PEK", "PVG", "HKG", "BKK", "DEL", "TPE", "KUL"
        );

        // Novas listas para categorizar por região e cobrar o preço justo
        List<String> asiaOriente = Arrays.asList("DXB", "DOH", "NRT", "ICN", "SIN", "PEK", "PVG", "HKG", "BKK", "DEL", "TPE", "KUL");
        List<String> europa = Arrays.asList("LIS", "LHR", "CDG", "MAD", "AMS", "FRA", "MXP", "FCO", "ZRH", "IST", "VIE", "MUC", "ATH", "BCN");
        List<String> americaNorte = Arrays.asList("MIA", "JFK");
        List<String> americaSul = Arrays.asList("SCL", "EZE", "LIM");

        java.util.function.BiFunction<String, String, BigDecimal> calcularPrecoBase = (orig, dest) -> {
            String chave1 = orig + "-" + dest;
            String chave2 = dest + "-" + orig;
            Integer distancia = distancias.getOrDefault(chave1, distancias.get(chave2));

            double taxaKm;
            double tarifaFixa;

            // Se a distância não estiver mapeada, calculamos por região do mundo
            if (distancia == null) {
                if (asiaOriente.contains(orig) || asiaOriente.contains(dest)) {
                    distancia = 13000;
                    taxaKm = 0.50; // Passagem cara
                    tarifaFixa = 800.0;
                } else if (europa.contains(orig) || europa.contains(dest)) {
                    distancia = 9500;
                    taxaKm = 0.45;
                    tarifaFixa = 500.0;
                } else if (americaNorte.contains(orig) || americaNorte.contains(dest)) {
                    distancia = 7000;
                    taxaKm = 0.40;
                    tarifaFixa = 400.0;
                } else if (americaSul.contains(orig) || americaSul.contains(dest)) {
                    distancia = 3000;
                    taxaKm = 0.35;
                    tarifaFixa = 250.0;
                } else {
                    distancia = 2000; // Nacional genérico
                    taxaKm = 0.25;
                    tarifaFixa = 100.0;
                }
            } else {
                // Se encontrou a distância exata no mapa inicial
                boolean isInternacional = internacionaisList.contains(orig) || internacionaisList.contains(dest);
                taxaKm = isInternacional ? 0.35 : 0.25;
                tarifaFixa = isInternacional ? 300.0 : 100.0;
            }

            return BigDecimal.valueOf(tarifaFixa + (distancia * taxaKm));
        };

        // Arrays de origens e destinos super populados
        String[] origens = {"GRU", "CGH", "BSB", "GIG", "SDU", "REC", "SSA", "CNF", "POA", "CWB", "FOR", "MAO", "MCZ", "FLN", "BEL", "VIX",
                "SCL", "EZE", "MIA", "JFK", "LIS", "LHR", "CDG", "MAD", "AMS", "FRA", "MXP", "DXB", "DOH", "NRT", "ICN", "SIN",
                "FCO", "ZRH", "IST", "VIE", "MUC", "ATH", "BCN", "PEK", "PVG", "HKG", "BKK", "DEL", "TPE", "KUL"};

        String[] destinos = {"GRU", "CGH", "BSB", "GIG", "SDU", "REC", "SSA", "CNF", "POA", "CWB", "FOR", "MAO", "MCZ", "FLN", "BEL", "VIX",
                "SCL", "EZE", "MIA", "JFK", "LIS", "LHR", "CDG", "MAD", "AMS", "FRA", "MXP", "DXB", "DOH", "NRT", "ICN", "SIN",
                "FCO", "ZRH", "IST", "VIE", "MUC", "ATH", "BCN", "PEK", "PVG", "HKG", "BKK", "DEL", "TPE", "KUL"};

        String[] companhias = {"LATAM", "GOL", "AZUL", "American", "Delta", "United", "Air France", "TAP", "Iberia", "British Airways", "Emirates", "Qatar Airways", "Lufthansa", "Turkish Airlines", "Singapore Airlines", "Cathay Pacific", "ANA", "ITA Airways"};

        FlightClass[] classes = {FlightClass.ECONOMICA, FlightClass.EXECUTIVA};
        Random rand = new Random();
        List<Flight> flights = new ArrayList<>();

        // 🌟 LÓGICA DINÂMICA DE VOLUMETRIA CONFIGURADA PARA 1000 VOOS / 7 DIAS NO RENDER
        int totalVoos = (System.getenv("RENDER") != null) ? 1000 : 20000;
        int intervaloDias = (System.getenv("RENDER") != null) ? 7 : 60;

        for (int i = 0; i < totalVoos; i++) {
            String origem = origens[rand.nextInt(origens.length)];
            String destino;
            do {
                destino = destinos[rand.nextInt(destinos.length)];
            } while (destino.equals(origem));

            // Gera as datas dentro do limite estipulado (7 dias para a nuvem)
            LocalDate data = LocalDate.now().plusDays(rand.nextInt(intervaloDias));
            LocalTime partida = LocalTime.of(rand.nextInt(24), rand.nextInt(12) * 5);
            String cia = companhias[rand.nextInt(companhias.length)];
            FlightClass classe = classes[rand.nextInt(classes.length)];

            BigDecimal precoBase = calcularPrecoBase.apply(origem, destino);
            double variacao = 0.85 + (rand.nextDouble() * 0.3);
            BigDecimal precoFinal = precoBase.multiply(BigDecimal.valueOf(variacao))
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            // Multiplicador da classe Executiva
            if (classe == FlightClass.EXECUTIVA) {
                precoFinal = precoFinal.multiply(BigDecimal.valueOf(2.5))
                        .setScale(2, java.math.RoundingMode.HALF_UP);
            }

            int assentos = 20 + rand.nextInt(180);
            String id = cia.substring(0, Math.min(2, cia.length())).toUpperCase() + String.format("%05d", i);

            // ===============================================================
            // APLICAÇÃO DO PADRÃO BUILDER AQUI
            // Substituímos os "setters" por uma construção fluída e blindada
            // ===============================================================
            Flight voo = new Flight.FlightBuilder()
                    .id(id)
                    .from(origem)
                    .to(destino)
                    .date(data)
                    .departure(partida)
                    .airline(cia)
                    .price(precoFinal)
                    .flightClass(classe)
                    .availableSeats(assentos)
                    .build();

            int totalAssentos = assentos;
            for (int j = 0; j < totalAssentos; j++) {
                int fileira = (j / 6) + 1;
                char letra = (char) ('A' + (j % 6));
                String seatNumber = fileira + String.valueOf(letra);

                Seat seat = new Seat();
                seat.setSeatNumber(seatNumber);
                seat.setAvailable(true);
                seat.setFlight(voo);
                voo.getSeats().add(seat);
            }

            flights.add(voo);
        }

        flightRepository.saveAll(flights);
        System.out.println(">>> " + flights.size() + " voos gerados com sucesso utilizando o Padrão Builder e Nova Precificação!");
    }
}