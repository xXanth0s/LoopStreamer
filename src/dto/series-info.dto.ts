import { SeriesMetaInfoDto } from './series-meta-info.dto';

export interface SeriesInfoDto extends SeriesMetaInfoDto {
    posterHref: string;
    seasonsLinks: { [key: number]: string };

}
