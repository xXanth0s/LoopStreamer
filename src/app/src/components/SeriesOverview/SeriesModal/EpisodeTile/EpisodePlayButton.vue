<template>
    <div class="flex flex-column justify-center mr-2 w-24">
        <div class="mb-2 flex justify-center min-w-full">
            <language-icon class="mx-1"
                           v-for="language in languages"
                           :key="language"
                           @click.native="languageClicked(language)"
                           :image-src="languageFlagMap[language].src"
                           :title="languageFlagMap[language].title"
                           :is-active="language === selectedLanguage"/>
        </div>
        <button type="button" :disabled="links.length === 0" class="btn btn-primary btn-sm w-30">Abspielen</button>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Inject, Prop } from 'vue-property-decorator';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import SeriesEpisode from '../../../../../../store/models/series-episode.model';
    import { SHARED_TYPES } from '../../../../../../shared/constants/SHARED_TYPES';
    import { StoreService } from '../../../../../../shared/services/store.service';
    import { MessageService } from '../../../../../../shared/services/message.service';
    import { LinkModel } from '../../../../../../store/models/link.model';
    import { LANGUAGE } from '../../../../../../store/enums/language.enum';
    import { getLinksForEpisode } from '../../../../../../store/selectors/línk.selector';
    import { isLoadingSeason, isPreparingVideo } from '../../../../../../store/selectors/control-state.selector';
    import LanguageIcon from '../../../LanguageIcon.vue';
    import { LABGUAGE_FLAG_DATA_MAP } from '../../../../data/language-flag-data.map';

    @Component({
        name: 'episode-play-button',
        components: {
            LanguageIcon,
        },
    })
    export default class EpisodePlayButton extends Vue {
        private readonly takeUntil$ = new Subject();
        private readonly languageFlagMap = LABGUAGE_FLAG_DATA_MAP;

        private links: LinkModel[] = [];
        private isLoadingEpisode = false;
        private isSeasonLoading = false;
        private selectedLanguage: LANGUAGE = LANGUAGE.GERMAN;

        @Prop(String)
        private episodeKey: SeriesEpisode['key'];

        @Inject(SHARED_TYPES.StoreService)
        private store: StoreService;

        @Inject(SHARED_TYPES.MessageService)
        private messageService: MessageService;

        private get languages(): LANGUAGE[] {
            return [ ...new Set(this.links.map(link => link.language)) ];
        }

        private mounted(): void {
            this.fetchLinksFromStore();
            this.fetchSeasonLoadingStateFromStore();
            this.fetchLoadingStateFromStore();
        }

        private fetchLinksFromStore(): void {
            this.store.selectBehaviour(getLinksForEpisode, this.episodeKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(links => this.links = links);
        }

        private fetchSeasonLoadingStateFromStore(): void {
            this.store.selectBehaviour(isLoadingSeason).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isSeasonLoading = isLoading);
        }

        private fetchLoadingStateFromStore(): void {
            this.store.selectBehaviour(isPreparingVideo).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isLoadingEpisode = isLoading);
        }

        private languageClicked(language: LANGUAGE): void {
            this.selectedLanguage = language;
        }
    }
</script>

<style scoped>

</style>
