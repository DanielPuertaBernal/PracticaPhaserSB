package com.practicaPhaser.JuegoRamona.controller.JuegoRamona;

import com.practicaPhaser.JuegoRamona.domain.JuegoRamona.JuegoRamona;
import com.practicaPhaser.JuegoRamona.services.JuegoRamona.JuegoRamonaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/juego")
@CrossOrigin
public class JuegoRamonaController {

    @Autowired
    private JuegoRamonaService juegoRamonaService;

    // POST -> Guardar
    @PostMapping
    public ResponseEntity<JuegoRamona> guardarJuego(@RequestBody JuegoRamona juego) {
        JuegoRamona nuevo = juegoRamonaService.guardarJuego(juego);
        return ResponseEntity.ok(nuevo);
    }

    // GET -> Obtener todos
    @GetMapping
    public ResponseEntity<List<JuegoRamona>> obtenerTodos() {
        List<JuegoRamona> lista = juegoRamonaService.obtenerTodos();
        return ResponseEntity.ok(lista);
    }
}
