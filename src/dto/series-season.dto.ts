import { PORTALS } from '../store/enums/portals.enum';
import { LanguageLinkCollection } from '../store/models/language-link.model';
import { SeriesEpisodeDto } from './series-episode.dto';

export interface SeriesSeasonDto {
    seriesTitle: string;
    seasonNumber: string;
    portal: PORTALS;
    seasonLinks: LanguageLinkCollection;
    episodes: SeriesEpisodeDto[];

}
