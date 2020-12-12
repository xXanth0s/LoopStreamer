<template>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { SeriesDto } from '../../data/series-dto.model';

    @Component({
        name: 'series-carousel',
        components: {},
    })
    export default class SeriesCarousel extends Vue {

        @Prop(Object)
        series: SeriesDto[];

        @Prop({ required: true, type: String })
        title: string;

    }
</script>

<style scoped>

</style>
