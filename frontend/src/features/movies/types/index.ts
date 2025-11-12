// Movies Feature - Type Definitions

export interface Movie {
    imdbID: string
    Title: string
    Year: string
    Poster: string
    Type: string
}

export interface MovieSearchParams {
    query: string
    page?: number
}

export interface MovieSearchResult {
    movies: Movie[]
    totalResults: number
    success: boolean
    error?: string
}

export interface MovieSections {
    trending: Movie[]
    popular: Movie[]
    latest: Movie[]
}
