<template>
    <span>
        <i class="far fa-question-circle"
           ref="infoButton"/>
        <b-tooltip :target="infoButton" triggers="hover" v-if="isMounted" variant="light">
            {{text}}
        </b-tooltip>
    </span>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';

    @Component({
        name: 'info-tooltip',
    })
    export default class InfoTooltip extends Vue {

        isMounted = false;

        @Prop({
            required: true,
            type: String,
        })
        public text: string;

        public get infoButton() {
            return this.$refs.infoButton;
        }

        mounted(): void {
            this.isMounted = true;
        }
    }
</script>

<style lang="scss">
    @import "src/styles/variables";

    .tooltip {
        padding: 0;
        margin-bottom: 6px;
        margin-top: 6px;
        opacity: 1 !important;
        border: $border;
    }
</style>
