import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {platforms} from "@/app/constants";


interface MovieCardProps {
    id: string;
    title: string;
    genres: string[];
    rating: number;
    posterUrl: string;
    detailsUrl: string;
    platforms: string[];
    userGenres: string[];
    userPlatforms: string[];
}

const MovieCard: React.FC<MovieCardProps> = ({ title, genres, rating, posterUrl, detailsUrl, platforms, userGenres, userPlatforms }) => {
    // Pfad zum Platzhalterbild
    const placeholderUrl = "/placeholder.svg";

    const userGenresSafe = userGenres ?? [];
    const userPlatformsSafe = userPlatforms ?? [];


    //Runden der Bewertung auf den nächsten halben Schritt
    const roundedRating = Math.round(rating * 2) / 2;


    //Logik zur Erstellung der Sterne
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (roundedRating >= i) {
                stars.push(<FaStar key={i} color="white" />);
            } else if (roundedRating >= i - 0.5) {
                stars.push(<FaStarHalfAlt key={i} color="white" />);
            } else {
                stars.push(<FaRegStar key={i} color="white" />);
            }
        }

        if (rating === 0) {
            stars.push(<span className="unrated">- nicht bewertet</span>);
        }

        return stars;
    };


    const renderGenreList = () => {
        return genres.map((genre, idx) => (
            <span key={genre}>
              {userGenresSafe.includes(genre) ? (
                  <span className="text-highlight">{genre}</span>
              ) : (
                  genre
              )}
              {idx < genres.length - 1 ? ', ' : ''}
            </span>
        ));
    };


    const renderPlatformList = () => {
        if (!platforms || platforms.length === 0) {
            return "keine Informationen";
        }

        return platforms.map((platform, idx) => (
            <span key={platform}>
              {userPlatformsSafe.includes(platform) ? (
                  <span className="text-highlight">{platform}</span>
              ) : (
                  platform
              )}
                        {idx < platforms.length - 1 ? ', ' : ''}
            </span>
        ));
    };

    const truncateText = (text: string, maxLength: number) => {
        return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
    };


    return (
        <div className="movie-card">
            <div className="movie-card-content">
                <img
                    src={posterUrl || placeholderUrl} // Nutze den Platzhalter, falls posterUrl fehlt
                    alt={title || "Placeholder"}
                    className="poster"
                />
                <div className="movie-info">
                    <h3 className="movie-title">
                        {truncateText(title, 40)}
                    </h3>
                    <div className="star-rating">{renderStars()}</div>
                    <p className="movie-genres">Genres: {renderGenreList()}</p>
                    <p className="movie-genres">Plattformen: {renderPlatformList()}</p>
                    <a href={detailsUrl} target="_blank" rel="noopener noreferrer" className="details-button">
                        Mehr Details
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
