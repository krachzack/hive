<template>
  <a class="nav-sink nav-group-item" v-bind:class="{active: selected}" v-on:click.prevent="$emit('sinkselect', item)">
    <span class="icon icon-record" v-bind:class="{'nav-sink-available': item.connected, 'nav-sink-unavailable': !item.connected}"></span>
    {{ item.name }}
  </a>
</template>

<script>
  export default {
    name: 'nav-sink',
    props: ['item', 'selected'],
    methods: {
    }
  }
</script>

<style lang="scss">
.nav-sink .nav-sink-available {
  color: $color-success !important;
}

.nav-sink .nav-sink-unavailable {
  color: $color-error;
}
</style>
