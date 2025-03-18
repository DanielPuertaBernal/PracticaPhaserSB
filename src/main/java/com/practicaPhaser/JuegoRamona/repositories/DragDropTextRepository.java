package com.practicaPhaser.dragdrop.repositories;

import com.practicaPhaser.dragdrop.domain.DragDropText;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DragDropTextRepository extends JpaRepository<DragDropText, Long> {
}
