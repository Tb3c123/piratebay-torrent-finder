// Shared type definitions

export interface Torrent {
    id: string
    title: string
    magnetLink: string
    size: string
    uploaded: string
    seeders: number
    leechers: number
    detailsUrl: string | null
    category?: string
    username?: string
    status?: string
    infoHash?: string
    imdb?: string | null
}

export interface MovieDetails {
    Title: string
    Year: string
    Rated: string
    Released: string
    Runtime: string
    Genre: string
    Director: string
    Writer: string
    Actors: string
    Plot: string
    Language: string
    Country: string
    Awards: string
    Poster: string
    Ratings: Array<{ Source: string; Value: string }>
    Metascore: string
    imdbRating: string
    imdbVotes: string
    imdbID: string
    Type: string
    DVD: string
    BoxOffice: string
    Production: string
    Website: string
}

export interface AnimeDetails {
    malId: number
    title: string
    titleEnglish?: string
    titleJapanese?: string
    type: string
    episodes?: number
    status: string
    aired: {
        from: string
        to: string | null
        string: string
    }
    season?: string
    year?: number
    score?: number
    scoredBy?: number
    rank?: number
    popularity?: number
    members?: number
    favorites?: number
    synopsis?: string
    background?: string
    image: string
    imageWebp?: string
    trailer?: string
    studios: Array<{ name: string }>
    genres: Array<{ name: string }>
    themes: Array<{ name: string }>
    demographics: Array<{ name: string }>
    producers: Array<{ name: string }>
    licensors: Array<{ name: string }>
    duration?: string
    rating?: string
    source?: string
}

export interface SearchResult {
    torrents: Torrent[]
    query: string
    success: boolean
}
