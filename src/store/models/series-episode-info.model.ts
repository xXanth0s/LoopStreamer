export default interface SeriesEpisodeInfo {
    seriesKey: string,
    season: number,
    episode: number,
    hasNextEpisode: boolean,
    hasPreviousEpisode: boolean,
    portalHref?: string,
    providorHref?: string,
    timestamp?: number,
}
