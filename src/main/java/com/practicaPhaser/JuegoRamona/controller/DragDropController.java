package com.practicaPhaser.dragdrop.controller;

import com.practicaPhaser.dragdrop.domain.DragDropText;
import com.practicaPhaser.dragdrop.services.DragDropService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dragdrop")
@CrossOrigin(origins = "http://localhost:3000")
public class DragDropController {

    @Autowired
    private DragDropService service;

    // GET /api/dragdrop/random -> Devuelve un DragDropText aleatorio
    @GetMapping("/random")
    public DragDropText getRandomText() {
        DragDropText random = service.getRandomText();
        // Si no hay registros, podrías retornar null o un status 404
        return random;
    }

    // POST /api/dragdrop/validate/{id} -> Recibe un array de strings y valida
    @PostMapping("/validate/{id}")
    public boolean validateAnswers(@PathVariable Long id, @RequestBody List<String> answers) {
        return service.validateAnswers(id, answers);
    }
}
