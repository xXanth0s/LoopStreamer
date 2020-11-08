<template>
    <b-modal hide-footer v-model="value">
        <template #modal-title>
            {{title}} löschen
        </template>
        <div class="d-block text-center">
            <span>Wollen Sie die Serie {{title}} wirklich löschen?</span>
        </div>
        <div class="flex flex-row justify-between mt-3">
            <b-button @click="close" variant="primary">Abbrechen</b-button>
            <b-button @click="approved" variant="outline-primary">Bestätigen</b-button>
        </div>
    </b-modal>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Emit, Prop, Watch } from 'vue-property-decorator';

    @Component({
        name: 'series-delete-modal',
    })
    export default class SeriesDeleteModal extends Vue {

        @Prop(String)
        public title;

        @Prop(Boolean)
        value: boolean;

        @Watch('value')
        private setValue(newValue): void {
            console.log(newValue);
            this.$emit('input', newValue);
        }

        @Emit('approved')
        private approved(): boolean {
            return true;
        }

        private close(): void {
            this.setValue(false);
        }
    }
</script>
