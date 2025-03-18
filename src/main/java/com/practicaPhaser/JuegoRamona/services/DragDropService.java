package com.practicaPhaser.dragdrop.services;

import com.practicaPhaser.dragdrop.domain.DragDropText;
import com.practicaPhaser.dragdrop.repositories.DragDropTextRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class DragDropService {

    @Autowired
    private DragDropTextRepository repository;

    // Devuelve un texto aleatorio de la BD
    public DragDropText getRandomText() {
        List<DragDropText> all = repository.findAll();
        if (all.isEmpty()) {
            return null;
        }
        Random rand = new Random();
        return all.get(rand.nextInt(all.size()));
    }

    // Valida si el array de 'answers' coincide con las palabras_faltantes
    public boolean validateAnswers(Long id, List<String> answers) {
        DragDropText dd = repository.findById(id).orElse(null);
        if (dd == null) {
            return false;
        }
        // Separa las palabras correctas
        String[] correct = dd.getPalabrasFaltantes().split(",");
        if (correct.length != answers.size()) {
            return false;
        }
        // Compara una por una (ignorando mayúsculas/minúsculas)
        for (int i = 0; i < correct.length; i++) {
            if (!correct[i].equalsIgnoreCase(answers.get(i))) {
                return false;
            }
        }
        return true;
    }
}
