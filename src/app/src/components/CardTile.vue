<template>
    <div class="card-container">
        <div v-if="title">
            <h3>{{title}}</h3>
            <hr>
        </div>
        <slot/>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import { Prop } from 'vue-property-decorator';

    @Component({
        name: 'card-tile',
    })
    export default class CardTile extends Vue {
        @Prop(String)
        private title: string;
    }
</script>

<style lang="scss" scoped>
    @import "src/styles/variables";

    .card-container {
        color: #333;
        border: 1px solid $borderColor;
        background: linear-gradient(to bottom, $containerBackground 61%, $containerBackground 100%);
        border-radius: 3px;
        box-shadow: 1px 1px 4px -1px rgba(0, 0, 0, .5);
        padding: 15px;
        position: relative;
        margin-bottom: 15px;
        box-sizing: content-box;

        .title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 10px;
            margin-top: 15px;

        }

        hr {
            margin-top: 5px;
            margin-bottom: 25px;
        }

    }
</style>
