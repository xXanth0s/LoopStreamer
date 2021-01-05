<template>
    <div>

    </div>

</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { Series } from '../../../../../store/models/series.model';

    @Component({
        name: 'series-settings',
    })
    export default class SeriesSettings extends Vue {
        @Prop(Object)
        private series: Series;
    }
</script>

<style scoped>

</style>
