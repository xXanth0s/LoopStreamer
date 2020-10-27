<template>
    <div>
        <nav-bar/>
        <div class="container">
            <div class="tab-content">
                <div class="tab-pane active">
                    <router-view/>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import NavBar from './components/NavBar.vue';

    @Component({
        components: {
            NavBar,
        },
    })
    export default class MainPage extends Vue {
    }

</script>

<style lang="scss" scoped>
    @import 'src/styles/variables';

    .container {
        margin-top: 70px;
        min-width: 800px;
        width: $containerWidth;
        background-color: $containerBackground;
        min-height: 760px;
        padding: 20px;
    }
</style>
