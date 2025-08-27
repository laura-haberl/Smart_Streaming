"use client";

import { Suspense } from "react";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import { CopilotKit } from "@copilotkit/react-core";
import {UserPreferencesProvider, useUserPreferences} from "@/contexts/UserPreferencesContext";
import { userId } from "@/app/constants";
import "./globals.css";
import {TrendingMoviesProvider} from "@/contexts/TrendingMoviesContext";
import {GenresProvider} from "@/contexts/GenresContext";
import {RecommendedMoviesProvider} from "@/contexts/RecommendedMoviesContext";
import {StaticRecommendationsProvider} from "@/contexts/StaticRecommendationsContext";

const inter = Inter({ subsets: ["latin"] });

const StaticRecommendationsWrapper = ({ children }: { children: React.ReactNode }) => {
    const { userPreferences } = useUserPreferences(); // Hole `userPreferences` hier
    return (
        <StaticRecommendationsProvider userPreferences={userPreferences}>
            {children}
        </StaticRecommendationsProvider>
    );
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <CopilotKit runtimeUrl="/api/copilotkit">
            <UserPreferencesProvider userId={userId}>
                <TrendingMoviesProvider>
                    <GenresProvider>
                        <RecommendedMoviesProvider>
                            <StaticRecommendationsWrapper>
                                <Navbar />
                                <Suspense>{children}</Suspense>
                            </StaticRecommendationsWrapper>
                        </RecommendedMoviesProvider>
                    </GenresProvider>
                </TrendingMoviesProvider>
            </UserPreferencesProvider>
        </CopilotKit>
        </body>
        </html>
    );
}
