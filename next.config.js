/** @type {import('next').NextConfig} */
module.exports = {
    experimental: {
        esmExternals: "loose", // Beibehalten
        serverComponentsExternalPackages: ["mongoose"], // Beibehalten
    },
    webpack: (config) => {
        // Aktivieren der Layers-Option
        config.experiments = {
            topLevelAwait: true,
            layers: true, // Dies aktiviert die Layer-Option
        };
        return config;
    },
    env: {
        NEXT_PUBLIC_TMDB_API_KEY: process.env.TMDB_API_KEY, // API-Key aus der .env-Datei
    },
};
