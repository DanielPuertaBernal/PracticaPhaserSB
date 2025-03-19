package com.practicaPhaser.JuegoRamona.domain.DragDrop;

import jakarta.persistence.*;

@Entity
@Table(name = "dragdrop")
public class DragDropText {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "texto_base", nullable = false)
    private String textoBase;

    @Column(name = "palabras_faltantes", nullable = false)
    private String palabrasFaltantes;

    public DragDropText() {
    }

    public DragDropText(String textoBase, String palabrasFaltantes) {
        this.textoBase = textoBase;
        this.palabrasFaltantes = palabrasFaltantes;
    }

    public Long getId() {
        return id;
    }

    public String getTextoBase() {
        return textoBase;
    }

    public void setTextoBase(String textoBase) {
        this.textoBase = textoBase;
    }

    public String getPalabrasFaltantes() {
        return palabrasFaltantes;
    }

    public void setPalabrasFaltantes(String palabrasFaltantes) {
        this.palabrasFaltantes = palabrasFaltantes;
    }
}
