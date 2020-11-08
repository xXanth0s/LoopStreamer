<template>
    <b-toast :id="selector" solid>
        <template #toast-title>
            {{title}}
        </template>
        <div class="flex-row flex items-center">
            <i :class="iconMap[context]" class="mr-3"></i>
            <span>
                <slot></slot>
            </span>
        </div>
    </b-toast>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';
    import { Context } from '../enums/context.enum';
    import { ContextIconMap } from '../data/context-icon.map';

    @Component({
        name: 'toast',
    })
    export default class Toast extends Vue {

        @Prop(String)
        public title;
        @Prop(String)
        public context: Context;
        @Prop(String)
        public selector: string;
        private readonly iconMap = ContextIconMap;
    }
</script>

<style scoped>

</style>
