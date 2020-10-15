<template>
    <div class="ls-container">
        <div class="vertical-felx fixed-top most-top">
            <div class="drag-container flex-full-size"
                 @mouseover.self="mouseEnteringButtons"
                 @mouseout.self="mouseLeavingButtons">
            </div>
            <window-control-buttons :hide-buttons="true"/>
        </div>
    </div>

</template>

<script lang="ts">

    import Component from 'vue-class-component';
    import Vue from 'vue';
    import { debounceTime, filter, tap } from 'rxjs/operators';
    import { Subject } from 'rxjs';
    import WindowControlButtons from '../../../shared/html/components/WindowControlButtons.vue';

    @Component({
        name: 'CustomFrame',
        components: {
            WindowControlButtons,
        },
    })
    export default class CustomFrame extends Vue {

        private readonly buttonsVisibilityTime = 5000;

        private showButtons = true;
        private isMouseOnButton = false;

        private hideButtons$ = new Subject();

        public mounted(): void {
            this.initMouseEventListeners();
            this.hideButtons$.next(true);
        }

        private initMouseEventListeners(): void {
            this.hideButtons$.pipe(
                tap(() => this.showButtons = true),
                debounceTime(this.buttonsVisibilityTime),
                filter(() => !this.isMouseOnButton),
            ).subscribe(() => {
                this.showButtons = false;
            });
        }

        private mouseEnteringButtons(): void {
            this.isMouseOnButton = true;
            this.hideButtons$.next();
        }

        private mouseLeavingButtons(): void {
            this.isMouseOnButton = false;
            this.hideButtons$.next();
        }
    }
</script>

<style scoped>

</style>
