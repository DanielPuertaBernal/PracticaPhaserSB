package com.practicaPhaser.JuegoRamona.services.quizgame;



import com.practicaPhaser.JuegoRamona.domain.quizgame.QuizQuestion;
import com.practicaPhaser.JuegoRamona.domain.quizgame.QuizUserResponse;
import com.practicaPhaser.JuegoRamona.repositories.quizgame.QuizQuestionRepository;
import com.practicaPhaser.JuegoRamona.repositories.quizgame.QuizUserResponseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class QuizUserResponseService {

    @Autowired
    private QuizUserResponseRepository userResponseRepo;

    @Autowired
    private QuizQuestionRepository questionRepo;

    public QuizUserResponse validateAndSave(QuizUserResponse response) {
        // Buscar la pregunta
        Optional<QuizQuestion> optQ = questionRepo.findById(response.getQuestionId());
        if (!optQ.isPresent()) {
            // Podrías asignar isCorrect = false o retornar null
            response.setIsCorrect(false);
            return userResponseRepo.save(response);
        }
        QuizQuestion question = optQ.get();

        // Validar
        boolean isCorrect = question.getCorrectOption().equalsIgnoreCase(response.getChosenOption());
        response.setIsCorrect(isCorrect);

        // Guardar
        return userResponseRepo.save(response);
    }
}
