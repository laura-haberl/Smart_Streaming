"use client";

import "@copilotkit/react-ui/styles.css";
import Chatbot from "../components/Chatbot";
import { userId } from './constants';
import {UserPreferencesProvider, useUserPreferences} from "@/contexts/UserPreferencesContext";
import {useTrendingMovies} from "@/contexts/TrendingMoviesContext";
import MovieCarousel from "@/components/MovieCarousel";
import {useRecommendedMovies} from "@/contexts/RecommendedMoviesContext";
import {useStaticRecommendations} from "@/contexts/StaticRecommendationsContext";


export default function Home() {
    return (
       <div>
            <Chatbot userId={userId} /> {}
            <Content />
       </div>
    );
}

function Content() {
    const { userPreferences, loading } = useUserPreferences();
    const { mappedTrendingMovies, loadingTrends } = useTrendingMovies();
    const { mappedRecommendationsDynamic } = useRecommendedMovies();
    const { mappedRecommendationsStatic } = useStaticRecommendations();
    let greeting1: string;
    let greeting2: string;

    if (loading && loadingTrends) {
        return <div className="home-container"><p>Loading...</p></div>;
    }

    const userName = userPreferences?.name || "";

    console.log("recomm static", mappedRecommendationsStatic);

    if(userPreferences?.initialInteractionCompleted){
        greeting1 = "Hallo " + userName + "!";
        greeting2 = "Basierend auf deinen bisherigen Interessen haben wir dir einige Vorschläge erstellt, die dir sicher gefallen werden.\n" +
            "Zögere jedoch nicht, den Chatbot nach weiteren Empfehlungen zu fragen.";
    }
    else{
        greeting1 = "Hallo " + userName + "!";
        greeting2 = "Damit du nicht nur Filme und Serien siehst, die bei anderen Nutzern beliebt sind, sondern Empfehlungen erhältst, die perfekt zu dir passen, benötigen wir mehr Informationen über deine Interessen.\n" +
            "Klicke einfach auf den Chatbot, um den Personalisierungsprozess zu starten – es wird sich lohnen!"
    }


    return (
        <div className="home-space">
            <div className="home-container">
                <h1 className="heading">{greeting1}</h1>
                <p>{greeting2}</p>
            </div>
            {mappedRecommendationsDynamic && mappedRecommendationsDynamic.length > 0 && (
                <MovieCarousel title="Empfehlungen des Chatbots" movies={mappedRecommendationsDynamic} />
            )}
            {mappedRecommendationsStatic.length > 0 && userPreferences?.initialInteractionCompleted &&(
                <MovieCarousel title="Empfehlungen auf Basis deiner Präferenzen" movies={mappedRecommendationsStatic} />
            )}
            <MovieCarousel
                title="Trend-Filme der Woche"
                movies={mappedTrendingMovies}

            />
        </div>
    );

}
