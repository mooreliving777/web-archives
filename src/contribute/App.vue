<template>
  <vn-app id="app">
    <vn-contribute
      :extName="extName"
      :extSlug="extSlug"
      :notice="notice"
      @open="contribute"
    >
    </vn-contribute>
  </vn-app>
</template>

<script>
import {App} from 'vueton';
import {Contribute} from 'vueton/components/contribute';

import {showPage} from 'utils/app';
import {getText} from 'utils/common';

export default {
  components: {
    [App.name]: App,
    [Contribute.name]: Contribute
  },

  data: function () {
    return {
      extName: getText('extensionName'),
      extSlug: 'web-archives',
      notice: ''
    };
  },

  methods: {
    setup: function () {
      const query = new URL(window.location.href).searchParams;
      if (query.get('action') === 'auto') {
        this.notice = `This page is shown once a year while using the extension,
        the search results can be found in the next tab.`;
      }
    },

    contribute: async function ({url} = {}) {
      await showPage({url});
    }
  },

  created: function () {
    document.title = getText('pageTitle', [
      getText('pageTitle_contribute'),
      this.extName
    ]);

    this.setup();
  }
};
</script>

<style lang="scss">
@use 'vueton/styles' as vueton;

@include vueton.theme-base;

.v-application__wrap {
  display: flex;
  align-items: center;
}
</style>
