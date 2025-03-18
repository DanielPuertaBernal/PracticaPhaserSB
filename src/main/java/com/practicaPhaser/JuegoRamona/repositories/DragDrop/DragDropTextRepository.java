package com.practicaPhaser.JuegoRamona.repositories;

import com.practicaPhaser.JuegoRamona.domain.DragDropText;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DragDropTextRepository extends JpaRepository<DragDropText, Long> {
}
