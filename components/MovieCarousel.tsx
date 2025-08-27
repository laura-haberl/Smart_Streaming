import React, { useState, useEffect, useRef } from "react";
import MovieCard from "./MovieCard";
import {useUserPreferences} from "@/contexts/UserPreferencesContext";

interface MovieCarouselProps {
    title: string;
    movies: {
        id: string;
        title: string;
        genres: string[];
        rating: number;
        posterUrl: string;
        detailsUrl: string;
        platforms: string[];
    }[];
}

const MovieCarousel: React.FC<MovieCarouselProps> = ({ title, movies }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState(3);
    const carouselRef = useRef<HTMLDivElement>(null);
    const { userPreferences } = useUserPreferences();


    // Berechnung der sichtbaren Elemente basierend auf der Container-Breite
    useEffect(() => {
        const calculateVisibleItems = () => {
            if (!carouselRef.current) return;

            const containerWidth = carouselRef.current.offsetWidth;
            const cardWidth = 400;
            const gap = 20;
            const fullCardWidth = cardWidth + gap;

            const items = Math.floor((containerWidth + gap) / fullCardWidth);
            setVisibleItems(items);
            setCurrentIndex(0); // <<< HIER wichtig: Reset auf Anfang!
        };

        calculateVisibleItems();
        window.addEventListener("resize", calculateVisibleItems);

        return () => {
            window.removeEventListener("resize", calculateVisibleItems);
        };
    }, []);


    const handlePrev = () => {
        setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            Math.min(prevIndex + 1, movies.length - visibleItems)
        );
    };

    return (
        <section className="movie-carousel">
            <h2 className="carousel-title">{title}</h2>
            <div className="carousel-wrapper" ref={carouselRef}>
                <button
                    className="carousel-button prev-button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                >
                    ◀
                </button>
                <div
                    className="carousel-container"
                >
                    <div
                        className="carousel-track"
                        style={{
                            transform: `translateX(-${currentIndex * (400 + 20)}px)`,
                            transition: "transform 0.3s ease-in-out",
                            display: "flex",
                            gap: "20px",
                        }}
                    >
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                title={movie.title}
                                genres={movie.genres}
                                rating={movie.rating}
                                posterUrl={movie.posterUrl}
                                detailsUrl={movie.detailsUrl}
                                platforms={movie.platforms}
                                userGenres={userPreferences.genres}
                                userPlatforms={userPreferences.platforms}
                            />
                        ))}
                    </div>
                </div>


                <button
                    className="carousel-button next-button"
                    onClick={handleNext}
                    disabled={currentIndex >= movies.length - visibleItems}
                >
                    ▶
                </button>
            </div>
        </section>
    );
};

export default MovieCarousel;
