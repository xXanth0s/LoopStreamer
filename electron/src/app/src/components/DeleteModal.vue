<template>
    <div class="modal fade" id="myModal" role="dialog">
        <div class="modal-dialog modal-sm">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">{{title}} löschen</h4>
                </div>
                <div class="modal-body">
                    <p>Möchten Sie wirklich {{title}} löschen?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" @click="close(false)">Abbrechen</button>
                    <button type="button" class="btn btn-default" @click="close(true)">Löschen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import { Emit, Prop } from 'vue-property-decorator';
    import Component from 'vue-class-component';


    @Component({
        name: 'delete-modal',
    })
    export default class DeleteModal extends Vue {
        @Prop(String)
        title = '';

        @Emit('close')
        public close(deleteClicked: boolean): boolean {
            return deleteClicked;
        }
    }
</script>
