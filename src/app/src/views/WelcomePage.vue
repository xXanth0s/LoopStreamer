<template>
    <div>
        <div class="content-block">
            <h2>LoopStreamer Beta Version</h2>
            <div class="row">
                <div class="description">
                    <span>Willkommen zur BetaVersion des LoopStreamers.</span>
                    <br>
                    <span>Die beste Erweitung zum Streamen von Filmen bietet folgende Funktionen</span> <br>
                    <span class="-underline">Features</span>
                    <ul>
                        <li>
                            <span>Automatisches wiedergeben von Videos ganzen Serienstaffeln auf verschiedenen Portalen </span>
                        </li>
                        <li>
                            <span>Individuelles überspringen von Intro und Outro</span>
                        </li>
                        <li>
                            <span>Speichern des Zeitstempels der zuletzt gesehenen Folge einer Serie</span>
                        </li>
                        <li>
                            <span>Adblocker</span>
                        </li>
                        <li>
                            <span>Geräteübergreifendes Speichern der Serien und Einstellungen</span>
                        </li>
                    </ul>
                    <div class="cont-box">
                        <div class="row col-row">
                            <div class="col-sm-2">
                                <button class="btn btn-default" title="Leider noch nicht verfügbar" disabled>Bewerten</button>
                            </div>
                            <div class="col-sm-8">
                                Auf dem Chrome Web Store
                            </div>
                        </div>
                        <div class="row col-row">
                            <div class="col-sm-2">
                                <button class="btn btn-default" title="Leider noch nicht verfügbar" disabled>Spenden</button>
                            </div>
                            <div class="col-sm-8">
                                Für Loopstremer über Paypal
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';

    @Component({
        name: 'welcome-page',
    })
    export default class WelcomePage extends Vue {
    }

</script>
