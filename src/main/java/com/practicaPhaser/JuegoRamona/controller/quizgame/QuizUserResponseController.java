package com.practicaPhaser.JuegoRamona.controller.quizgame;

import com.practicaPhaser.JuegoRamona.domain.quizgame.QuizUserResponse;
import com.practicaPhaser.JuegoRamona.services.quizgame.QuizUserResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-response")
@CrossOrigin
public class QuizUserResponseController {

    @Autowired
    private QuizUserResponseService service;

    // POST /api/user-response
    // Recibimos la entidad QuizUserResponse directamente en el body
    @PostMapping
    public QuizUserResponse validateAndSave(@RequestBody QuizUserResponse response) {
        // Se valida la respuesta (correct/incorrect) antes de guardar
        QuizUserResponse saved = service.validateAndSave(response);
        return saved;
    }
}
