// Movies Feature - Central Exports

// Components
export { MovieCard } from './components/MovieCard'
export { MovieGrid } from './components/MovieGrid'
export { MovieSearchBar } from './components/MovieSearchBar'

// Hooks
export { useMovieSearch } from './hooks/useMovieSearch'
export { useMovieSections } from './hooks/useMovieSections'

// Services
export { moviesService } from './services/moviesService'

// Types
export type {
    Movie,
    MovieSearchParams,
    MovieSearchResult,
    MovieSections,
} from './types'
