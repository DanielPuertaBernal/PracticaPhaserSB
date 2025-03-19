package com.practicaPhaser.JuegoRamona.controller.quizgame;

import com.practicaPhaser.JuegoRamona.domain.quizgame.QuizQuestion;
import com.practicaPhaser.JuegoRamona.services.quizgame.QuizQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/question")
@CrossOrigin
public class QuizQuestionController {

    @Autowired
    private QuizQuestionService service;

    // GET /api/question/random -> Devuelve una pregunta aleatoria
    @GetMapping("/random")
    public QuizQuestion getRandomQuestion() {
        QuizQuestion q = service.getRandomQuestion();
        return q;
    }

    // GET /api/question/{id} -> Devuelve una pregunta específica
    @GetMapping("/{id}")
    public QuizQuestion getQuestionById(@PathVariable Long id) {
        Optional<QuizQuestion> opt = service.findById(id);
        return opt.orElse(null);
    }
}