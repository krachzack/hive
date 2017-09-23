<template>
  <div id="app">
    <div class="pane-group">

      <div class="pane-sm sidebar">
        <nav class="nav-group">
          <h5 class="nav-group-title">Sinks</h5>
          <nav-sink v-for="(sink, idx) in sinks"
                    v-bind:key="sink.id"
                    v-bind:item="sink"
                    v-bind:selected="(!selectedSinkId && idx == 0) || isSelected(sink)"
                    v-on:sinkselect="select($event)"></nav-sink>
          
          <h5 class="nav-group-title">Swarms</h5>
          <a class="nav-group-item">
            <span class="icon icon-record" style="color:#fc605b"></span>
            Wohnzimmer
          </a>
          <span class="nav-group-item">
            <span class="icon icon-record" style="color:green"></span>
            Büro
          </span>
        </nav>
      </div>

      <div class="pane">
        <div class="padded-more">
          <sink-editor v-bind:item="selectedSink" v-bind:screenColor="screenColor"></sink-editor>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
  import NavSink from '@/components/NavSink'
  import SinkEditor from '@/components/SinkEditor'

  export default {
    name: 'hive',
    components: {
      NavSink,
      SinkEditor
    },
    props: ['sinks', 'screenColor'],
    methods: {
      select (sink) { this.selectedSinkId = sink.id },
      isSelected (sink) { return this.selectedSinkId === sink.id }
    },
    data () {
      return {
        selectedSinkId: null
      }
    },
    computed: {
      selectedSink () { return this.sinks.find((sink) => this.selectedSinkId === sink.id) || this.sinks[0] }
    },
    watchers: {
      sinks () { this.selectedSinkId = this.selectedSinkId || (this.sinks.length === 0 ? undefined : this.sinks[0].id) }
    }
  }
</script>

<style lang="scss">
  /* CSS */
</style>
