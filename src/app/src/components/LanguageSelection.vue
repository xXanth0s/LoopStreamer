<template>
    <div class="flex items-center justify-content-center" v-if="isVisible">
        <language-icon class="mx-1"
                       v-for="language in availableLanguages"
                       :key="language"
                       @click.native="languageClicked(language)"
                       :image-src="languageFlagMap[language].src"
                       :title="languageFlagMap[language].title"
                       :is-active="language === selectedLanguage"/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Subject } from 'rxjs';
    import { takeUntil } from 'rxjs/operators';
    import { Prop, Watch } from 'vue-property-decorator';
    import { StoreService } from '../../../shared/services/store.service';
    import { optionsContainer } from '../container/container';
    import { SHARED_TYPES } from '../../../shared/constants/SHARED_TYPES';
    import { getSelectedLanguageOrLastUsedSeriesLanguageForSeason } from '../../../store/selectors/app-control-state.selector';
    import { LANGUAGE } from '../../../store/enums/language.enum';
    import { getAvailableLanguagesForSeasonAndActivePortal } from '../../../store/selectors/series-season.selector';
    import LanguageIcon from './LanguageIcon.vue';
    import { LABGUAGE_FLAG_DATA_MAP } from '../data/language-flag-data.map';
    import { userChangedLanguageAction } from '../../../store/actions/shared.actions';

    @Component({
        name: 'language-selection',
        components: {
            LanguageIcon,
        },
    })
    export default class LanguageSelection extends Vue {
        private readonly languageFlagMap = LABGUAGE_FLAG_DATA_MAP;
        private readonly takeUntil$ = new Subject();

        @Prop({
            type: String,
        })
        private seasonKey: string;

        private store: StoreService;

        private selectedLanguage: LANGUAGE = LANGUAGE.NONE;
        private availableLanguages: LANGUAGE[] = [];

        public get isVisible(): boolean {
            return this.seasonKey
                && this.selectedLanguage
                && this.availableLanguages.length > 0;
        }

        public beforeCreate(): void {
            this.store = optionsContainer.get<StoreService>(SHARED_TYPES.StoreService);
        }

        public destroyed(): void {
            this.takeUntil$.next();
        }

        @Watch('seasonKey', { immediate: true })
        private seasonChanged(): void {
            if (this.seasonKey) {
                this.takeUntil$.next();
                this.fetchAvailableLanguagesFromStore();
                this.fetchSelectedLanguageFromStore();
            }
        }

        private fetchAvailableLanguagesFromStore(): void {
            this.store.selectBehaviour(getAvailableLanguagesForSeasonAndActivePortal, this.seasonKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(languages => this.availableLanguages = languages);
        }

        private fetchSelectedLanguageFromStore(): void {
            this.store.selectBehaviour(getSelectedLanguageOrLastUsedSeriesLanguageForSeason, this.seasonKey).pipe(
                takeUntil(this.takeUntil$),
            ).subscribe(language => this.selectedLanguage = language);
        }

        private languageClicked(selectedLanguage: LANGUAGE): void {
            if (this.selectedLanguage !== selectedLanguage) {
                this.store.dispatch(userChangedLanguageAction({ selectedLanguage, seriesSeasonKey: this.seasonKey }));
            }
        }
    }
</script>
