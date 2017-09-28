<template>
  <div v-if="item">
    <h1 >{{ item.name }}</h1>

    <h2>Device Information</h2>

    <dl>
      <dt>Input Mode</dt>
      <dd><span class="icon icon-record" v-bind:style="cssColor(enabledColor)"></span> {{ item.inputMode }}</dd>

      <dt>Unique ID</dt>
      <dd>{{ item.id }}</dd>

      <dt>IP Address</dt>
      <dd>{{ item.address }}</dd>

      <dt>Connected</dt>
      <dd><span class="icon icon-record" v-bind:class="{'sink-editor-ok': item.connected, 'sink-editor-error': !item.connected}"></span></dd>
    </dl>

    <h2>Color</h2>
    <form>
      <div class="form-group">
        <label>Direct color input <span class="icon icon-record" v-bind:style="cssColor(item.pickerColor)"></span></label>
        <chrome-picker v-model="item.pickerColor" v-on:input="item.inputMode = 'picker'"></chrome-picker>
      </div>

      <div class="form-group">
        <label>Screen capture <span class="icon icon-record" v-bind:style="cssColor(screenColor)"></span></label>
      </div>

      <div class="form-actions">
        <button class="btn btn-form btn-default" v-on:click.prevent="item.inputMode = 'screen'">{{ (item.inputMode === 'screen') ? 'Enabled' : 'Enable' }}</button>
      </div>
    </form>
  </div>
  <div v-else>
    <h1>No sink selected …</h1>
  </div>
</template>

<script>
  import { Chrome } from 'vue-color'
  import tinycolor from 'tinycolor2'
  import { ipcRenderer } from 'electron'

  export default {
    name: 'sink-editor',
    components: {
      'chrome-picker': Chrome
    },
    props: ['item', 'screenColor'],
    methods: {
      cssColor: function (raw) {
        let color

        if (typeof raw === 'undefined' || !raw) {
          color = 'black'
        } else if (typeof raw === 'string') {
          color = raw
        } else {
          const { r, g, b } = tinycolor(raw.rgba).toRgb()
          color = `rgb(${r}, ${g}, ${b})`
        }

        return { color }
      }
    },
    computed: {
      inputMode () { return this.item ? this.item.inputMode : null },
      pickerColor () { return this.item ? this.item.pickerColor : null },
      enabledColor () {
        switch (this.inputMode) {
          case 'picker':
            return this.item.pickerColor
          case 'screen':
            return this.screenColor
          case null:
            return 'transparent'
          default:
            throw new Error(`Illegal input mode ${this.inputMode}`)
        }
      }
    },
    watch: {
      inputMode: passInputModeToMain,
      pickerColor: passPickerColorToMain
    }
  }

  function passInputModeToMain (newInputMode) {
    ipcRenderer.send('sink-post', { id: this.item.id, inputMode: newInputMode })
  }

  function passPickerColorToMain (newColorRaw) {
    const colorObj = (typeof newColorRaw === 'string') ? tinycolor(newColorRaw) : tinycolor(newColorRaw.hex)
    const { r, g, b } = colorObj.toRgb()
    ipcRenderer.send('sink-post', { id: this.item.id, pickerColor: new Uint8Array([r, g, b]) })
  }
</script>

<style lang="scss">
  .sink-editor-ok {
    color: $color-success;
  }
  .sink-editor-error {
    color: $color-error;
  }
</style>
