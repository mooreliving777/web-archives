<template>
  <vn-app id="app" v-if="dataLoaded" :class="appClasses">
    <div class="section-engines">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_engines') }}
      </div>
      <div class="section-desc" v-once>
        {{ getText('optionSectionDescription_engines') }}
      </div>

      <v-draggable
        class="option-wrap"
        v-model="options.engines"
        item-key="id"
        :delay="120"
      >
        <template #item="{element}">
          <div class="option">
            <vn-checkbox
              :label="getText(`optionTitle_${element}`)"
              :model-value="engineEnabled(element)"
              @click="setEngineState(element, $event.target.checked)"
            >
            </vn-checkbox>
          </div>
        </template>
      </v-draggable>
    </div>

    <div class="section-context-menu" v-if="contextMenuEnabled">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_contextmenu') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_showInContextMenu')"
            :items="listItems.showInContextMenu"
            v-model="options.showInContextMenu"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option select" v-if="searchAllEnginesEnabled">
          <vn-select
            :label="getText('optionTitle_searchAllEngines')"
            :items="listItems.searchAllEnginesContextMenu"
            v-model="options.searchAllEnginesContextMenu"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_openCurrentDocContextMenu')"
            v-model="options.openCurrentDocContextMenu"
          ></vn-switch>
        </div>
      </div>
    </div>

    <div class="section-toolbar">
      <div class="section-title" v-once>
        {{
          getText(
            $env.isMobile
              ? 'optionSectionTitleMobile_toolbar'
              : 'optionSectionTitle_toolbar'
          )
        }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_searchMode')"
            :items="listItems.searchModeAction"
            v-model="options.searchModeAction"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option select" v-if="searchAllEnginesEnabled">
          <vn-select
            :label="getText('optionTitle_searchAllEngines')"
            :items="listItems.searchAllEnginesAction"
            v-model="options.searchAllEnginesAction"
            transition="scale-transition"
          >
          </vn-select>
        </div>
        <div class="option" v-if="pageActionEnabled">
          <vn-switch
            :label="getText('optionTitle_showPageAction')"
            v-model="options.showPageAction"
          ></vn-switch>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_openCurrentDocAction')"
            v-model="options.openCurrentDocAction"
          ></vn-switch>
        </div>
      </div>
    </div>

    <div class="section-misc">
      <div class="section-title" v-once>
        {{ getText('optionSectionTitle_misc') }}
      </div>
      <div class="option-wrap">
        <div class="option select">
          <vn-select
            :label="getText('optionTitle_appTheme')"
            :items="listItems.appTheme"
            v-model="options.appTheme"
            transition="scale-transition"
          >
          </vn-select>
        </div>

        <div class="option" v-if="!$env.isAndroid">
          <vn-switch
            :label="getText('optionTitle_tabInBackgound')"
            v-model="options.tabInBackgound"
          ></vn-switch>
        </div>
        <div class="option">
          <vn-switch
            :label="getText('optionTitle_showEngineIcons')"
            v-model="options.showEngineIcons"
          ></vn-switch>
        </div>
        <div class="option" v-if="enableContributions">
          <vn-switch
            :label="getText('optionTitle_showContribPage')"
            v-model="options.showContribPage"
          ></vn-switch>
        </div>
        <div class="option button" v-if="enableContributions">
          <vn-button
            class="contribute-button vn-icon--start"
            @click="showContribute"
            ><vn-icon
              src="/src/assets/icons/misc/favorite-filled.svg"
            ></vn-icon>
            {{ getText('buttonLabel_contribute') }}
          </vn-button>
        </div>
      </div>
    </div>
  </vn-app>
</template>

<script>
import {toRaw} from 'vue';
import {App, Button, Checkbox, Icon, Select, Switch} from 'vueton';
import {includes, without} from 'lodash-es';
import draggable from 'vuedraggable';

import storage from 'storage/storage';
import {getListItems, showContributePage} from 'utils/app';
import {getText} from 'utils/common';
import {enableContributions} from 'utils/config';
import {optionKeys} from 'utils/data';

export default {
  components: {
    'v-draggable': draggable,
    [App.name]: App,
    [Button.name]: Button,
    [Checkbox.name]: Checkbox,
    [Icon.name]: Icon,
    [Switch.name]: Switch,
    [Select.name]: Select
  },

  data: function () {
    let showInContextMenu = ['all', 'link', 'false'];
    if (this.$env.isMobile) {
      showInContextMenu = showInContextMenu.filter(item => item !== 'all');
    }

    return {
      dataLoaded: false,

      listItems: {
        ...getListItems(
          {showInContextMenu},
          {scope: 'optionValue_showInContextMenu'}
        ),
        ...getListItems(
          {
            searchAllEnginesContextMenu: ['main', 'sub', 'false']
          },
          {scope: 'optionValue_searchAllEnginesContextMenu'}
        ),
        ...getListItems(
          {searchAllEnginesAction: ['main', 'sub', 'false']},
          {
            scope: this.$env.isMobile
              ? 'optionValue_searchAllEnginesActionMobile'
              : 'optionValue_searchAllEnginesAction'
          }
        ),
        ...getListItems(
          {searchModeAction: ['tab', 'url']},
          {scope: 'optionValue_searchModeAction'}
        ),
        ...getListItems(
          {appTheme: ['auto', 'light', 'dark']},
          {scope: 'optionValue_appTheme'}
        )
      },

      enableContributions,

      contextMenuEnabled: true,
      searchAllEnginesEnabled: true,
      pageActionEnabled: true,

      options: {
        engines: [],
        disabledEngines: [],
        showInContextMenu: '',
        searchAllEnginesContextMenu: '',
        searchAllEnginesAction: '',
        showPageAction: false,
        tabInBackgound: false,
        searchModeAction: '',
        showEngineIcons: false,
        openCurrentDocAction: false,
        openCurrentDocContextMenu: false,
        appTheme: '',
        showContribPage: false
      }
    };
  },

  computed: {
    appClasses: function () {
      return {
        'feature-context-menu': this.contextMenuEnabled
      };
    }
  },

  methods: {
    getText,

    setup: async function () {
      const options = await storage.get(optionKeys);

      for (const option of Object.keys(this.options)) {
        this.options[option] = options[option];

        this.$watch(
          `options.${option}`,
          async function (value) {
            await storage.set({[option]: toRaw(value)});
            await browser.runtime.sendMessage({id: 'optionChange'});
          },
          {deep: true}
        );
      }

      if (this.$env.isSamsung) {
        this.searchAllEnginesEnabled = false;
      } else {
        if (this.$env.isMobile) {
          this.contextMenuEnabled = false;
        }
      }

      if (!this.$env.isFirefox || this.$env.isMobile) {
        this.pageActionEnabled = false;
      }

      this.dataLoaded = true;
    },

    engineEnabled: function (engine) {
      return !includes(this.options.disabledEngines, engine);
    },

    setEngineState: async function (engine, enabled) {
      if (enabled) {
        this.options.disabledEngines = without(
          this.options.disabledEngines,
          engine
        );
      } else {
        this.options.disabledEngines.push(engine);
      }
    },

    showContribute: async function () {
      await showContributePage();
    }
  },

  created: function () {
    document.title = getText('pageTitle', [
      getText('pageTitle_options'),
      getText('extensionName')
    ]);

    this.setup();
  }
};
</script>

<style lang="scss">
@use 'vueton/styles' as vueton;

@include vueton.theme-base;
@include vueton.transitions;

.v-application__wrap {
  display: grid;
  grid-row-gap: 32px;
  grid-column-gap: 48px;
  padding: 24px;
  grid-auto-rows: min-content;
  grid-auto-columns: min-content;
}

.section-title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.25px;
  line-height: 32px;
}

.section-desc {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.25px;
  line-height: 20px;

  padding-top: 8px;
  width: 272px;
}

.option-wrap {
  display: grid;
  grid-row-gap: 24px;
  padding-top: 24px;
}

.option {
  display: flex;
  align-items: center;
  height: 20px;

  &.button {
    height: 40px;
  }

  &.select,
  &.text-field {
    height: 56px;
  }
}

.contribute-button {
  @include vueton.theme-prop(color, primary);

  & .vn-icon {
    @include vueton.theme-prop(background-color, cta);
  }
}

@media (min-width: 1024px) {
  .v-application__wrap {
    grid-template-columns: 464px 464px;
    grid-template-rows: min-content min-content 1fr;
    grid-template-areas:
      'engines toolbar'
      'engines misc'
      'engines placeholder';
  }

  .feature-context-menu {
    & .v-application__wrap {
      grid-template-rows: min-content min-content min-content 1fr;
      grid-template-areas:
        'engines context-menu'
        'engines toolbar'
        'engines misc'
        'engines placeholder';
    }
  }

  .section-engines {
    grid-area: engines;
  }

  .section-context-menu {
    grid-area: context-menu;
  }

  .section-toolbar {
    grid-area: toolbar;
  }

  .section-misc {
    grid-area: misc;
  }

  .section-placeholder {
    grid-area: placeholder;
    display: initial;
  }
}
</style>
