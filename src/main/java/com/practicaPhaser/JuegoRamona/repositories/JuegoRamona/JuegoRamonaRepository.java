package com.practicaPhaser.JuegoRamona.repositories.JuegoRamona;

import com.practicaPhaser.JuegoRamona.domain.JuegoRamona.JuegoRamona;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JuegoRamonaRepository extends JpaRepository<JuegoRamona, Long> {
    Optional<JuegoRamona> findByNombreJugador(String nombreJugador);
}
