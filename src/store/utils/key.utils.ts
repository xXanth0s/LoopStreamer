export const getKeyForSeriesTitle = (seriesTitle: string): string => {
    return seriesTitle?.toLowerCase().replace(/[^\w\s]/g,'').replace(/\s/g, "-");
}

export const getKeyForSeriesEpisode = (seriesKey: string, seasonNumber: number, episodeNumber: number): string => {
    return `${seriesKey}-S${seasonNumber}-E${episodeNumber}`;
}

export const getKeyForSeriesSeason = (seriesKey: string, seasonNumber: number): string => {
    return `${seriesKey}-S${seasonNumber}`;
}
