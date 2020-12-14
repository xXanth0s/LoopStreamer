<template>
    <div>
        {{series.descriptions[language]}}
    </div>
</template>

<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { Prop } from 'vue-property-decorator';
    import Series from '../../../../../store/models/series.model';
    import { LANGUAGE } from '../../../../../store/enums/language.enum';

    @Component({
        name: 'series-modal-description',
    })
    export default class SeriesModalDescription extends Vue {

        @Prop({
            required: true,
            type: Object,
        })
        private series: Series;

        @Prop({
            required: true,
            type: String,
        })
        private language: LANGUAGE;
    }
</script>

<style lang="scss" scoped>

</style>
