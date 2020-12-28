import { PORTALS } from '../store/enums/portals.enum';
import { LanguageLinkCollection } from '../store/models/language-link.model';
import { PortalSeriesEpisodeDto } from './portal-series-episode.dto';

export interface PortalSeriesSeasonDto {
    seasonNumber: string;
    portal: PORTALS;
    seasonLinks: LanguageLinkCollection;
    episodes: PortalSeriesEpisodeDto[];
}
