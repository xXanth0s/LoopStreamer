import SeriesEpisodeInfo from './series-episode-info.model'

export default interface Series {
    key: string,
    title: string,
    lastEpisodeWatched?: SeriesEpisodeInfo,
    startTimeConfigured?: boolean,
    endTimeConfigured?: boolean,
    imageHref: string,
    scipStartTime?: number,
    scipEndTime?: number
}
