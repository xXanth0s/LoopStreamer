// import Series from '../models/series.model';
//
// export const seriesMock: { [key: string]: Series } = {
//     '4-Blocks': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/4-blocks-stream-cover-285fm43suLUGG8AsIJNCLWri2Y2eV1AX_220x330.jpg',
//         key: '4-Blocks',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/4-blocks/staffel-1/episode-1',
//             season: 1,
//             seriesKey: '4-Blocks',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false,
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: '4 Blocks'
//     },
//     'Big-Time-Rush': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/big-time-rush-stream-cover-cSxwSDxhQGY0xZIx3MbxjkL19gTaBYVN_220x330.jpg',
//         key: 'Big-Time-Rush',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/big-time-rush/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'Big-Time-Rush',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Big Time Rush'
//     },
//     Bloodline: {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/bloodline-stream-cover-sDKk9NyFTtJGxk07RrdQBiHCBhtIPh4i_220x330.jpg',
//         key: 'Bloodline',
//         lastEpisodeWatched: {
//             episode: 0,
//             portalLinks: '',
//             season: 0,
//             seriesKey: '',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Bloodline'
//     },
//     'CSI:-Den-Tätern-auf-der-Spur': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/csi-stream-cover-NGMJPwlkX0pgy3ynz7Zn7ohdLthbwmJj_220x330.jpg',
//         key: 'CSI:-Den-Tätern-auf-der-Spur',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/csi/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'CSI:-Den-Tätern-auf-der-Spur',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'CSI: Den Tätern auf der Spur'
//     },
//     'Die-Simpsons': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/simpsons-stream-cover-wyq8ci1YM4pufMAupxEBXd3TTenbn4CT_220x330.jpg',
//         key: 'Die-Simpsons',
//         lastEpisodeWatched: {
//             episode: 9,
//             portalLinks: 'https://serienstream.to/serie/stream/simpsons/staffel-28/episode-9',
//             season: 28,
//             seriesKey: 'Die-Simpsons',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Die Simpsons'
//     },
//     'Dragonball-Z': {
//         endTimeConfigured: true,
//         posterHref: 'https://serienstream.to/public/img/cover/dragonball-z-stream-cover-sTxejLt97w19j7NswLkRRJwfQhTpb0iE_220x330.jpg',
//         key: 'Dragonball-Z',
//         lastEpisodeWatched: {
//             episode: 5,
//             portalLinks: 'https://serienstream.to/serie/stream/dragonball-z/staffel-1/episode-5',
//             season: 1,
//             seriesKey: 'Dragonball-Z',
//             timestamp: 5,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 39,
//         scipStartTime: 0,
//         startTimeConfigured: true,
//         title: 'Dragonball Z'
//     },
//     'Game-of-Thrones': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/game-of-thrones-stream-cover-H93sIdW1KgpizTi90HNk1QIyqU2Pkn11_220x330.JPG',
//         key: 'Game-of-Thrones',
//         lastEpisodeWatched: {
//             episode: 4,
//             portalLinks: 'https://serienstream.to/serie/stream/game-of-thrones/staffel-7/episode-4',
//             season: 7,
//             seriesKey: 'Game-of-Thrones',
//             timestamp: 10,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Game of Thrones'
//     },
//     'Grey\'s-Anatomy---Die-jungen-Ärzte': {
//         endTimeConfigured: true,
//         posterHref: 'https://serienstream.to/public/img/cover/grey-s-anatomy-die-jungen-aerzte-stream-cover-C71TlUP6LgCAScQGgizCuFZHh5WFqYy3_220x330.jpg',
//         key: 'Grey\'s-Anatomy---Die-jungen-Ärzte',
//         lastEpisodeWatched: {
//             episode: 3,
//             portalLinks: 'https://serienstream.to/serie/stream/grey-s-anatomy-die-jungen-aerzte/staffel-1/episode-3',
//             season: 1,
//             seriesKey: 'Grey\'s-Anatomy---Die-jungen-Ärzte',
//             timestamp: 10,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 92,
//         scipStartTime: 0,
//         startTimeConfigured: true,
//         title: 'Grey\'s Anatomy - Die jungen Ärzte'
//     },
//     'House-of-Cards': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/house-of-cards-stream-cover-Lo3tv7EebWhjdyD1QvjSxDXKnxprxCLi_220x330.jpg',
//         key: 'House-of-Cards',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/house-of-cards/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'House-of-Cards',
//             timestamp: 5,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'House of Cards'
//     },
//     'Marvel\'s-Iron-Fist': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/marvels-iron-fist-stream-cover-gBIit0zMhndd37WWjtjehMKiTFrW8ytp_220x330.jpg',
//         key: 'Marvel\'s-Iron-Fist',
//         lastEpisodeWatched: {
//             episode: 2,
//             portalLinks: 'https://serienstream.to/serie/stream/marvels-iron-fist/staffel-1/episode-2',
//             season: 1,
//             seriesKey: 'Marvel\'s-Iron-Fist',
//             timestamp: 110,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Marvel\'s Iron Fist'
//     },
//     'Orange-Is-the-New-Black': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/orange-is-the-new-black-stream-cover-2h6Ic6GbCrQJd7z3it3bEWq1ZDSj0D13_220x330.jpg',
//         key: 'Orange-Is-the-New-Black',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/orange-is-the-new-black/staffel-5/episode-1',
//             season: 5,
//             seriesKey: 'Orange-Is-the-New-Black',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Orange Is the New Black'
//     },
//     'Rick-and-Morty': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/rick-and-morty-stream-cover-fpEVIJft30VECzr9qvvwrsluPntFh1Xw_220x330.jpg',
//         key: 'Rick-and-Morty',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/rick-and-morty/staffel-3/episode-1',
//             season: 3,
//             seriesKey: 'Rick-and-Morty',
//             timestamp: 960,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Rick and Morty'
//     },
//     Stitchers: {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/test-stream-cover-3MgzqRkU3jGly9ZHreM4svVWMg3ntmox_220x330.jpg',
//         key: 'Stitchers',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/stitchers/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'Stitchers',
//             timestamp: 310,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'Stitchers'
//     },
//     'The-100': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/the-100-stream-cover-0qtUwW39VhoR7EDJxviA9svXfRo42Jp3_220x330.jpg',
//         key: 'The-100',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/the-100/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'The-100',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'The 100'
//     },
//     'The-Big-Bang-Theory': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/the-big-bang-theory-stream-cover-JCwFUDEIlm4Ld8CrEifZYBELsciAuKae_220x330.jpg',
//         key: 'The-Big-Bang-Theory',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/the-big-bang-theory/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'The-Big-Bang-Theory',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'The Big Bang Theory'
//     },
//     'The-Blacklist': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/the-blacklist-stream-cover-KK7HpcNx6HeYTZsxcyzuPbYo9PDfLr4v_220x330.jpg',
//         key: 'The-Blacklist',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/the-blacklist/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'The-Blacklist',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'The Blacklist'
//     },
//     'The-Walking-Dead': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/the-walking-dead-stream-cover-P15ijR7DqUeoLWXxc1jWaq4YWqlr79SW_220x330.jpg',
//         key: 'The-Walking-Dead',
//         lastEpisodeWatched: {
//             episode: 2,
//             portalLinks: 'https://serienstream.to/serie/stream/the-walking-dead/staffel-1/episode-2',
//             season: 1,
//             seriesKey: 'The-Walking-Dead',
//             timestamp: 5,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 1,
//         startTimeConfigured: true,
//         title: 'The Walking Dead'
//     },
//     'True-Detective': {
//         endTimeConfigured: false,
//         posterHref: 'https://serienstream.to/public/img/cover/true-detective-stream-cover-t3BDLheffUJ2lsr6KFiqCNuBIlHgPmQj_220x330.jpg',
//         key: 'True-Detective',
//         lastEpisodeWatched: {
//             episode: 1,
//             portalLinks: 'https://serienstream.to/serie/stream/true-detective/staffel-1/episode-1',
//             season: 1,
//             seriesKey: 'True-Detective',
//             timestamp: 0,
//             hasNextEpisode: true,
//             hasPreviousEpisode: false
//         },
//         scipEndTime: 0,
//         scipStartTime: 0,
//         startTimeConfigured: false,
//         title: 'True Detective'
//     }
// }
