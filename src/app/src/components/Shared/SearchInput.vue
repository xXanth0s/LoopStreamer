<template>
    <div>
        <div class="flex items-center h-8">
            <div class="input-field input-group h-8" :class="{visible: show}">
                <input type="text" class="form-control form-control-sm w-0" placeholder="Suche...">
                <button type="button" class="btn btn-sm bg-transparent -ml-6 z-50">
                    <i class="fa fa-times"></i>
                </button>
            </div>
            <i class="fas fa-search cursor-pointer ml-1 button" @click="show = !show"></i>
        </div>
    </div>
</template>

<script lang="ts">
    import Component from 'vue-class-component';
    import Vue from 'vue';

    @Component({
        name: 'search-input',
    })
    export default class SearchInput extends Vue {
        private show = false;
    }
</script>

<style scoped lang="scss">

    .input-field {
        width: 0;
        transition: width 1s;
        overflow: hidden;

        &.visible {
            width: 200px;
        }
    }
</style>
