package com.practicaPhaser.JuegoRamona.repositories.quizgame;


import com.practicaPhaser.JuegoRamona.domain.quizgame.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
}