package com.practicaPhaser.JuegoRamona.domain.JuegoRamona;
import jakarta.persistence.*;

@Entity
@Table(name = "juego_ramona")
public class JuegoRamona {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_jugador", nullable = false)
    private String nombreJugador;

    @Column(name = "tiempo", nullable = false)
    private Integer tiempo;


    @Column(name = "monedas_obtenidas", nullable = false)
    private Integer monedasObtenidas;

    // Constructores
    public JuegoRamona() {
    }

    public JuegoRamona(String nombreJugador, Integer tiempo, Integer monedasObtenidas) {
        this.nombreJugador = nombreJugador;
        this.tiempo = tiempo;
        this.monedasObtenidas = monedasObtenidas;
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public String getNombreJugador() {
        return nombreJugador;
    }

    public void setNombreJugador(String nombreJugador) {
        this.nombreJugador = nombreJugador;
    }

    public Integer getTiempo() {
        return tiempo;
    }

    public void setTiempo(Integer tiempo) {
        this.tiempo = tiempo;
    }

    public Integer getMonedasObtenidas() {
        return monedasObtenidas;
    }

    public void setMonedasObtenidas(Integer monedasObtenidas) {
        this.monedasObtenidas = monedasObtenidas;
    }
}
