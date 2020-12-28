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
        <button type="button"
                class="btn btn-primary btn-sm w-30"
                :disabled="isButtonDisabled"
                @click="startEpisode">
             <span v-if="isEpisodeLoading">
                <div class="spinner-border" role="status" style="width: 1rem; height: 1rem;">
                    <span classeries-modal-descriptions="sr-only"></span>
                </div>
            </span>
            <span v-else>
                Abspielen
            </span>
        </button>
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
    import { isPreparingEpisode } from '../../../../../../store/selectors/async-interaction.selector';
    import LanguageIcon from '../../../Shared/LanguageIcon.vue';
    import { LABGUAGE_FLAG_DATA_MAP } from '../../../../data/language-flag-data.map';
    import { startEpisodeAction } from '../../../../../../store/actions/shared.actions';

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
        private isEpisodeLoading = false;
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

        private get isButtonDisabled(): boolean {
            return this.links.length === 0 || this.isEpisodeLoading;
        }

        private mounted(): void {
            this.fetchLinksFromStore();
            this.fetchEpisodeLoadingStateFromStore();
        }

        private fetchLinksFromStore(): void {
            this.store.selectBehaviour(getLinksForEpisode, this.episodeKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(links => this.links = links);
        }

        private fetchEpisodeLoadingStateFromStore(): void {
            this.store.select(isPreparingEpisode, this.episodeKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(isLoading => this.isEpisodeLoading = isLoading);
        }

        private languageClicked(language: LANGUAGE): void {
            this.selectedLanguage = language;
        }

        private startEpisode(): void {
            this.store.dispatch(startEpisodeAction({ episodeKey: this.episodeKey, language: this.selectedLanguage }));
        }
    }
</script>

<style scoped>

</style>
