<template>
    <div class="content-block">
        <h2>FAQ</h2>
        <div class="row">
            <div class="col-3">
                <el-menu default-active="1" class="el-menu-vertical-demo" theme="dark">
                    <el-menu-item index="1">Bedienung</el-menu-item>
                    <el-menu-item index="2">Zur Beta Version</el-menu-item>
                    <el-menu-item index="3">Rechtliches</el-menu-item>
                </el-menu>
            </div>
            <div class="col-9">
                <h4>Bedienung</h4>
                <el-collapse v-model="activeName" accordion>
                    <el-collapse-item title="Wie starte ich LoopStreamer" name="1-1">
                        <div>Um eine Serie über den LoopStreamer zu starten, muss diese auf einem der unterstützen Portale geöffnet werden. Anschließend kann sie durch einen klick auf das LoopStreamer Logo in der rechten oberen Ecke, gestartet werden. Falls sie keine explizite Folge auswählen, wird automatisch mit der ersten Folge begonnen</div>
                    </el-collapse-item>
                    <el-collapse-item title="Wie komme ich auf diese Seite" name="1-2">
                        <div>Um auf die Optionsseite zu gelangen, startet man den LoopStreamer auf einer beliebigen Seite und klickt anschließend auf "Meine Serien"</div>
                        <div></div>
                    </el-collapse-item>
                    <el-collapse-item title="Welche Portale werden unterstützt" name="1-3">
                        <div>Momentan werden nur vier Portale uterstützt. Eine Weiterleitung finden Sie unter "Meine Serien. Falls du noch andere Portale kennst, dann maile uns diese bitte und wir versuchen sie schnellst möglich zu implementieren</div>
                        <ul>
                            <li>BurningSeries</li>
                            <li>Serienstream</li>
                            <li>Kinox</li>
                            <li>Movie4k</li>
                        </ul>
                    </el-collapse-item>
                    <el-collapse-item title="Zuletzt gesehene Serie fortsetzen" name="1-4">
                        <div>Um die zuletzt gesehene Serie fortzusetzen, drücken man einfach auf das LoopStreamer Symbol und anschließend auf "Letzte Serie fortsetzen"</div>
                    </el-collapse-item>
                    <el-collapse-item title="Kie kann ich eine Serie Fortsetzen" name="1-5">
                        <div>Von deinen geschauten Serien wird immer die zuletzt gesehene Folge und deren Fortschritt gespeichert. Um eine Serie fortzusetzen, öffne die Option Seite und gehe auf Meine Serien. Anschließend wählen Sie die Serie aus und klicken auf Fortsetzen</div>
                    </el-collapse-item>
                    <el-collapse-item title="Wie setzte ich die Zeiten für Intro und Outro" name="1-6">
                        <div>Falls für eine Serie noch keine Zeit für Intro oder Outro gesetzt wurde, wird ein Popup während des Streamen der Serie geöffnet. Mithilfe des Popups kann man die momentane Zeit des Streams als Startpunkt für die nächsten Folgen setzen. Falls man noch unsicher ist, wie lange das Intro ist, oder die erste Folge kein Intro besitzt, kann man die Konfiguration für diese Folge abbrechen. Am Ende einer Folge öffnet sich erneut ein Popup, über welches auf gleicher Weise die Outro Zeiten gesetzt werden können</div>
                    </el-collapse-item>
                    <el-collapse-item title="Ich habe das Intro/Outro falsch gesetzt, was jetzt?" name="1-7">
                        <div>Die Intro und Outro Zeiten können im Nachhinein bei "Meine Serien" geändert werden. Wenn man hier die komplette Serie zurücksetzt kann man die Intro/Outro Zeit erneut während des Streamens gesetzt werden</div>
                    </el-collapse-item>
                    <el-collapse-item title="Ich habe einen Fehler gefunden, wo kann ich ihn melden" name="7">
                        <div>Es tut uns sehr Leid, dass der LoopStreamer noch nicht ganz Fehlerfrei ist. </div>
                    </el-collapse-item>
                </el-collapse>
                <h4>Zur Beta Version</h4>
                <el-collapse v-model="activeName" accordion>
                    <el-collapse-item title="Was ist eine Beta Version?" name="2-1">
                        <div>Software entwickelt sich nur sehr langsam und ist zu Beginn immer reich an Fehler, welche auch Bugs genannt werden. Damit die finale Version möglichst frei von Fehlern ist, wird zuvor eine Beta Version zum testen gestartet. Diese Betaversion ist eine funktionierende Version, welche jedoch noch einige Fehler beinhaltet</div>
                    </el-collapse-item>
                    <el-collapse-item title="Ich habe einen Fehler gefunden, wo kann ich ihn melden?" name="2-2">
                        <div>Da wir selber nicht genügend Zeit haben, das Produkt ständig zu testen, freuen wir uns über jeden gemeldeten Fehler. Maile uns diese bitte an <a href="mailto:loop.streamer.info@gmail.com">loop.streamer.info@gmail.com</a></div>
                        <div>Bitte füge noch so viele Details wie möglich hinzu, dass eine bessere Analyse für uns möglich ist. Folgende Information wären wichtig für einen Bug-Report</div>
                        <ul>
                            <li>Das benutzte Streamingportal</li>
                            <li>Die Serie die geschaut wurde</li>
                            <li>Staffel und Episode</li>
                            <li>Der benutzte Streamingprovidor</li>
                            <li>Link zu dem Video</li>
                        </ul>
                    </el-collapse-item>
                    <el-collapse-item title="Ich habe Verbesserungsvorschläge" name="2-3">
                        <div>Super, bitte maile uns sie schnellst möglich an <a href="mailto:loop.streamer.info@gmail.com">loop.streamer.info@gmail.com</a>. Wir versuchen alle Ideen schnellst möglich umzusetzen</div>
                    </el-collapse-item>
                    <el-collapse-item title="Meine Freunde wollen LoopStreamer auch benutzen" name="2-4">
                        <div>Je mehr Tester, desto schneller wird LoopStreamer veröffentlich. Maile uns dafür die ID seines Google Kontos an <a href="mailto:loop.streamer.info@gmail.com">loop.streamer.info@gmail.com</a></div>
                    </el-collapse-item>
                    <el-collapse-item title="Wann wird LoopStreamer öffentlich gemacht?" name="2-5">
                        <div>Da Streamen seit neuersten Illegal ist, hat sich der Release auf ungewisse Zeit nach hinten verschoben. Unser Anwalt ist schon in Arbeit eine Entsprechende AGB zu formulieren, so dass LoopStreamer für jeden zugänglich gemacht werden kann. Leider sind die Anwaltskosten sehr hoch, weshalb wir uns über alle Spenden freuen</div>
                    </el-collapse-item>
                </el-collapse>
                <h4>Rechtliches</h4>
                <el-collapse v-model="activeName" accordion>
                    <el-collapse-item title="Ist LoopStreamer illegal" name="3-1">
                        <div>LoopStreamer an sich ist nicht illegal. Jedoch ist das Streamen von rechlichtlich geschützten Inhalten strafbar. Deswegen dürfen mit dem LoopStreamer nur Inhalte gestreamt werden, welche man bereits selbst besitzt</div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';

    @Component({
        name: 'info-page',
    })

    export default class WelcomePage extends Vue {
        activeName = '1';
    }
</script>
