
export const platforms = [
    "Netflix", "Amazon Prime Video", "Disney+", "HBO Max", "Hulu",
    "Apple TV+", "YouTube", "Google Play Movies", "Vudu", "Paramount+",
    "Peacock", "Rakuten TV", "Shudder", "Starz", "BBC iPlayer", "BritBox",
    "Crunchyroll"
];

export const languageLabels: { [key: string]: string } = {
    en: "Englisch",
    de: "Deutsch",
    fr: "Französisch",
    es: "Spanisch",
    it: "Italienisch",
    pt: "Portugiesisch",
    ru: "Russisch",
    jp: "Japanisch",
    kr: "Koreanisch",
    cn: "Chinesisch",
    tr: "Türkisch",
    sa: "Arabisch"
};
export const languages = Object.keys(languageLabels); // Gibt ["en", "de", "fr", "es", "it", "pt", ...] zurück


export const ageRestrictionLabels: { [key: string]: string } = {
    always: "Ja, immer",
    sometimes: "Ja, manchmal",
    never: "Nein",
};
export const ageRestriction = Object.keys(ageRestrictionLabels);


export const fskRatingLabels: { [key: string]: string } = {
    "0": "FSK 0",
    "6": "FSK 6",
    "12": "FSK 12",
    "16": "FSK 16",
};
export const fskRating = Object.keys(fskRatingLabels);

export const genreMappingLabels: { [key: string]: string } = {
    "Action": "28",
    "Abenteuer": "12",
    "Animation": "16",
    "Komödie": "35",
    "Krimi": "80",
    "Dokumentarfilm": "99",
    "Drama": "18",
    "Familie": "10751",
    "Fantasy": "14",
    "Historie": "36",
    "Horror": "27",
    "Musik": "10402",
    "Mystery": "9648",
    "Liebesfilm": "10749",
    "Science Fiction": "878",
    "TV-Film": "10770",
    "Thriller": "53",
    "Kriegsfilm": "10752",
    "Western": "37"
};
export const genreMappingIds: { [key: string]: string } = Object.fromEntries(
    Object.entries(genreMappingLabels).map(([key, value]) => [value, key])
);


export const platformMappingLabels: { [key: string]: string } = {
    "Netflix": "213",
    "Amazon Prime Video": "119",
    "Disney+": "337",
    "HBO Max": "49",
    "Hulu": "450",
    "Apple TV+": "276",
    "YouTube": "136",
    "Google Play Movies": "92",
    "Vudu": "157",
    "Paramount+": "6",
    "Rakuten TV": "130",
    "Shudder": "123",
    "Starz": "8",
    "BBC iPlayer": "77",
    "BritBox": "109",
    "Crunchyroll": "75"
};
export const platformMappingIds: { [key: string]: string } = Object.fromEntries(
    Object.entries(platformMappingLabels).map(([key, value]) => [value, key])
);

//Plattformnamen aus JustWatch - zu internen Bezeichnungen
export const providerNameToFrontendLabel: Record<string, string> = {
    "Amazon Video": "Amazon Prime Video",
    "Netflix": "Netflix",
    "Apple TV": "Apple TV+",
    "Google Play Movies": "Google Play Movies",
    "YouTube": "YouTube",
    "Rakuten TV": "Rakuten TV",

};


//67ff6b20cbe1c18f3e73e399 not set
//678e1fed057cf2cc84d3dbed set
export const userId = "684bcd1919ccd6df1100b830";