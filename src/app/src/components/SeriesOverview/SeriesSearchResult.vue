<template>

    <div>
        <div v-if="hasSearchRsult">

        </div>
        <div v-else class="flex justify-center items-center">

        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, } from 'vue-property-decorator';
import { NamedCollection } from '../../../../store/models/collection.model';
import { SeriesMetaInfo } from '../../../../store/models/series-meta-info.model';

@Component({
    name: 'SerieesSearchResult'
})
export default class SeriesSearchResult extends Vue {

    @Prop(Object)
    private searchResult: NamedCollection<SeriesMetaInfo>;

    private get hasSearchRsult(): boolean {
        return this.searchResult.data.length > 0;
    }

}
</script>

<style scoped>

</style>
