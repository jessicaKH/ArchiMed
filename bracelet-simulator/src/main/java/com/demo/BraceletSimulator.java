package com.demo;

import java.net.http.*;
import java.net.URI;
import java.util.*;
import java.util.concurrent.*;
import com.google.gson.Gson;

public class BraceletSimulator {
    private static final String BOITIER_URL = "http://boitier-server:5000/data";
    private static final List<Integer> buffer = new CopyOnWriteArrayList<>();
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final Gson gson = new Gson();

    public static void main(String[] args) {
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

        // Capteur BPM : 1 mesure / seconde
        scheduler.scheduleAtFixedRate(() -> {
            int bpm = new Random().nextInt(40) + 60; // entre 60 et 100
            // 💥 toutes les 20 secondes, simule une crise cardiaque
            long now = System.currentTimeMillis() / 1000;
            if (now % 20 < 2) {
                bpm = 170 + new Random().nextInt(30); // 170–200
                System.out.println("[Bracelet] ⚠️ CRISE DÉTECTÉE BPM=" + bpm);
                sendToBoitier(bpm); // envoi immédiat de la crise
                return;
            }

            buffer.add(bpm);
            System.out.println("[Bracelet] BPM: " + bpm);
        }, 0, 1, TimeUnit.SECONDS);

        // Envoi des moyennes toutes les 10 secondes
        scheduler.scheduleAtFixedRate(() -> {
            if (!buffer.isEmpty()) {
                double avg = buffer.stream().mapToInt(i -> i).average().orElse(0);
                buffer.clear();
                sendToBoitier(avg);
            }
        }, 10, 10, TimeUnit.SECONDS);
    }

    private static void sendToBoitier(double bpm) {
        try {
            String json = gson.toJson(Map.of("bpm", bpm));
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BOITIER_URL))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

            client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                  .thenAccept(r -> System.out.println("[Bracelet] 📨 Donnée envoyée au boîtier: " + bpm));
        } catch (Exception e) {
            System.out.println("[Bracelet] ❌ Erreur d’envoi: " + e.getMessage());
        }
    }
}
