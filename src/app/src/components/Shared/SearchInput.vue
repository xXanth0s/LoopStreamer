<template>
    <div>
        <div class="flex items-center h-8">
            <div class="input-field input-group h-8" :class="{visible: show}">
                <input v-model="searchText" class="form-control form-control-sm w-0" placeholder="Suche..." type="text">
                <button class="btn btn-sm bg-transparent -ml-6 z-50" type="button" @click="reset">
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
import { Emit, Watch } from 'vue-property-decorator';

@Component({
    name: 'search-input',
})
export default class SearchInput extends Vue {
    private show = false;
    private searchText = '';

    @Watch('searchText')
    @Emit('inputChanged')
    private inputChanged(): string {
        return this.searchText;
    }

    private reset(): void {
        this.searchText = '';
    }

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
