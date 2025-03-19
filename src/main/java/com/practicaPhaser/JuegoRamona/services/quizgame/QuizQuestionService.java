package com.practicaPhaser.JuegoRamona.services.quizgame;


import com.practicaPhaser.JuegoRamona.domain.quizgame.QuizQuestion;
import com.practicaPhaser.JuegoRamona.repositories.quizgame.QuizQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class QuizQuestionService {

    @Autowired
    private QuizQuestionRepository repository;

    public List<QuizQuestion> findAll() {
        return repository.findAll();
    }

    public Optional<QuizQuestion> findById(Long id) {
        return repository.findById(id);
    }

    // Si quieres obtener una pregunta aleatoria
    public QuizQuestion getRandomQuestion() {
        List<QuizQuestion> all = repository.findAll();
        if (all.isEmpty()) {
            return null;
        }
        int idx = (int) (Math.random() * all.size());
        return all.get(idx);
    }
}
