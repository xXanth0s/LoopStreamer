import { SeriesMetaInfoDto } from './series-meta-info.dto';

export interface SeriesInfoDto extends SeriesMetaInfoDto {
    posterHref: string;
    description: string;
    seasonsLinks: { [key: number]: string };

}
