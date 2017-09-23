import Vue from 'vue'
import App from './App'
import { ipcRenderer } from 'electron'

if (document.querySelector('#app')) {
  Vue.config.productionTip = false

  const vm = new Vue({
    components: { App },
    template: '<App v-bind:sinks="sinks" v-bind:screenColor="screenColor"/>',
    data: {
      sinks: [],
      screenColor: 'black'
    }
  }).$mount('#app')

  ipcRenderer.send('sink-service-discover')
  ipcRenderer.on('sink-service-status-change', function (event, arg) {
    const idx = vm.sinks.findIndex((sink) => sink.id === arg.id)

    if (idx === -1) {
      vm.sinks.push(arg)
    } else {
      // Overwrite with arg, but keep stuff that was there before
      Vue.set(vm.sinks, idx, Object.assign({}, vm.sinks[idx], arg))
    }
  })

  ipcRenderer.on('screen-color-change', function (event, arg) {
    vm.screenColor = `rgb(${arg[0]}, ${arg[1]}, ${arg[2]})`
  })
}
