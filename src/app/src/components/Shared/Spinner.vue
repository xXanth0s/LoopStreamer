<template>
    <div>
        <div class="flex flex-column h-full items-center justify-content-center">
            <div class="spinner-border" role="status" style="width: 3rem; height: 3rem;">
                <span class="sr-only"></span>
            </div>
            <span>{{ text }}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';

    @Component({
        name: 'spinner',
    })
    export default class Spinner extends Vue {
        @Prop(String)
        private text: string;
    }
</script>

<style scoped>

</style>
