package com.practicaPhaser.JuegoRamona.services.JuegoRamona;

import com.practicaPhaser.JuegoRamona.domain.JuegoRamona.JuegoRamona;
import com.practicaPhaser.JuegoRamona.repositories.JuegoRamona.JuegoRamonaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JuegoRamonaService {

    @Autowired
    private JuegoRamonaRepository repository;

    public JuegoRamona guardarJuego(JuegoRamona juego) {
        return repository.save(juego);
    }

    public List<JuegoRamona> obtenerTodos() {
        return repository.findAll();
    }

    // Otros métodos de negocio, por ejemplo, buscar por nombre, etc.
}
