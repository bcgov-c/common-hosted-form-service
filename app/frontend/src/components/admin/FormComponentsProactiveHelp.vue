<template>
  <div class="mt-5">
    <v-expansion-panels
      class="nrmc-expand-collapse"
      flat
      data-cy="info_link_expansion_panels"
    >
      <v-expansion-panel
        flat
        v-for="(groupName, index) in groupList"
        :key="index"
        @click="onExpansionPanelClick(groupName)"
      >
        <v-expansion-panel-header>
          <div class="header">
            <strong>{{ groupName }}</strong>
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <GeneralLayout
            :groupName="groupName"
            :layoutList="groupComponentsList"
            :componentsList="
              fcProactiveHelpGroupList && fcProactiveHelpGroupList[groupName]
                ? fcProactiveHelpGroupList[groupName]
                : []
            "
          />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import GeneralLayout from '@/components/infolinks/GeneralLayout.vue';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'FormComponentsProactiveHelp',
  components: { GeneralLayout },
  data() {
    return {
      layout: {
        'Basic Layout': [
          'Text/Images',
          'Columns - 2',
          'Columns - 3',
          'Columns - 4',
          'Tabs',
          'Panel',
        ],
        'Basic Fields': [
          'Text Field',
          'Multi-line Text',
          'Select List',
          'Checkbox',
          'Checkbox Group',
          'Radio Group',
          'Number',
          'Phone Number',
          'Email',
          'Date / Time',
          'Day',
        ],
        'Advanced Layout': [
          'HTML Element',
          'Content',
          'Columns',
          'Field Set',
          'Panel',
          'Table',
          'Tabs',
          'Well',
        ],
        'Advanced Fields': [
          'Text Field',
          'Email',
          'Text Area',
          'Url',
          'Number',
          'Phone Number',
          'Tags',
          'Address',
          'Password',
          'Date / Time',
          'Checkbox',
          'Day',
          'Time',
          'Select Boxes',
          'Select',
          'Currency',
          'Radio',
          'Survey',
          'Signature',
        ],
        'Advanced Data': [
          'Hidden',
          'Container',
          'Data Map',
          'Data Grid',
          'Edit Grid',
          'Tree',
        ],
        'BC Government': ['File Upload', 'Business Name Search', 'BC Address'],
      },
      isPanelOpened: new Map(),
      groupComponentsList: [],
      panelHeadStyle: new Map(),
    };
  },
  methods: {
    ...mapActions('admin', ['listFCProactiveHelp']),

    onExpansionPanelClick(groupName) {
      if (
        this.isPanelOpened.get(groupName) === undefined ||
        !this.isPanelOpened.get(groupName)
      ) {
        this.isPanelOpened.set(groupName, true);
        this.groupComponentsList = this.extractGroupComponents(groupName);
      } else {
        this.isPanelOpened.set(groupName, false);
      }

      for (let key of this.isPanelOpened.keys()) {
        if (key !== groupName) {
          this.isPanelOpened.set(key, false);
        }
      }
    },

    //extract form builder layout groups.
    extractGroups() {
      let allgroups = [];
      for (let [title] of Object.entries(this.layout)) {
        if (title) {
          allgroups.push(title);
          this.panelHeadStyle.set(title, this.notActivePanelHead);
        }
      }
      return allgroups;
    },

    //extract all components in the select group in form builder
    extractGroupComponents(groupName) {
      let groupComponents = [];
      for (let [title, components] of Object.entries(this.layout)) {
        if (title && title === groupName && components) {
          for (let componentName of components) {
            groupComponents.push({ componentName: componentName });
          }
        }
      }
      return groupComponents;
    },
  },
  computed: {
    ...mapGetters('admin', ['fcProactiveHelp', 'fcProactiveHelpGroupList']),
    groupList() {
      return this.extractGroups();
    },
  },
  watch: {
    fcProactiveHelp() {
      this.listFCProactiveHelp();
    },
  },
  mounted() {
    this.listFCProactiveHelp();
  },
};
</script>

<style lang="scss" scoped>
// Customized expand/collapse section
.nrmc-expand-collapse {
  min-height: 50px;
  .v-expansion-panel--active > .v-expansion-panel-header {
    min-height: 50px;
    background: #f1f8ff;
  }

  .v-expansion-panel-header {
    padding: 10px;
    background: #bfbdbd14;
    border: 1px solid #7070703f;

    .header {
      font-weight: normal;
      font-style: normal;
      font-family: BCSans !important;
      font-size: 18px;
      color: #313132;
    }

    &:hover {
      background: #f1f8ff;
    }
  }

  .v-expansion-panel:not(.v-expansion-panel--active) {
    margin-bottom: 5px;
  }

  .v-expansion-panel-header:hover {
    background: '#F1F8FF';
  }

  .v-expansion-panel-content__wrap {
    padding-top: 8px;
    padding-bottom: 0px !important;
  }
}
</style>
