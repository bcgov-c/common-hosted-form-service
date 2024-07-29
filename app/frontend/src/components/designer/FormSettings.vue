<script>
import { mapState, mapWritableState } from 'pinia';
import FormAccessSettings from '~/components/designer/settings/FormAccessSettings.vue';
import FormGeneralSettings from '~/components/designer/settings/FormGeneralSettings.vue';
import FormFunctionalitySettings from '~/components/designer/settings/FormFunctionalitySettings.vue';
import FormScheduleSettings from '~/components/designer/settings/FormScheduleSettings.vue';
import FormSubmissionSettings from '~/components/designer/settings/FormSubmissionSettings.vue';
import { useFormStore } from '~/store/form';

export default {
  components: {
    FormAccessSettings,
    FormGeneralSettings,
    FormFunctionalitySettings,
    FormScheduleSettings,
    FormSubmissionSettings,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapWritableState(useFormStore, ['form']),
    ...mapState(useFormStore, ['isFormPublished', 'isRTL']),
  },
};
</script>

<template>
  <v-container class="px-0" :class="{ 'dir-rtl': isRTL }">
    <v-row>
      <v-col cols="12" md="6">
        <FormGeneralSettings />
      </v-col>
      <v-col cols="12" md="6">
        <BasePanel class="fill-height">
          <template #title>
            <span :lang="lang">
              {{ $t('trans.formSettings.formAccess') }}
            </span></template
          >
          <v-radio-group
            class="my-0"
            v-model="userType"
            :mandatory="false"
            :rules="loginRequiredRules"
            @change="userTypeChanged"
          >
            <v-radio
              class="mb-4"
              :class="{ 'dir-rtl': isRTL }"
              :value="ID_MODE.PUBLIC"
            >
              <template #label>
                <span :class="{ 'mr-2': isRTL }" :lang="lang">
                  {{ $t('trans.formSettings.public') }}
                </span>
              </template>
            </v-radio>

            <v-expand-transition>
              <BaseInfoCard
                v-if="userType == ID_MODE.PUBLIC"
                class="mr-4 mb-3"
                :class="{ 'dir-rtl': isRTL }"
              >
                <h4 class="primary--text" :lang="lang">
                  <v-icon class="mr-1" color="primary">info</v-icon
                  >{{ $t('trans.formSettings.important') }}!
                </h4>
                <p class="mt-2 mb-0" :lang="lang">
                  {{ $t('trans.formSettings.info') }}
                  <a
                    href="https://engage.gov.bc.ca/govtogetherbc/"
                    target="_blank"
                  >
                    govTogetherBC.
                    <v-icon small color="primary">open_in_new</v-icon>
                  </a>
                </p>
              </BaseInfoCard>
            </v-expand-transition>
            <v-radio class="mb-4" value="login">
              <template #label>
                <span :class="{ 'mr-2': isRTL }" :lang="lang">
                  {{ $t('trans.formSettings.loginRequired') }}
                </span>
              </template>
            </v-radio>
            <v-expand-transition>
              <v-row v-if="userType === ID_MODE.LOGIN" class="pl-6">
                <v-radio-group class="my-0" v-model="idps[0]">
                  <v-radio class="mx-2" :value="ID_PROVIDERS.IDIR">
                    <template #label>
                      <span :class="{ 'mr-2': isRTL }"> IDIR </span>
                    </template>
                  </v-radio>
                  <v-radio class="mx-2" :value="ID_PROVIDERS.BCEIDBOTH">
                    <template #label>
                      <span :class="{ 'mr-2': isRTL }"> Basic or Business BCeID </span>
                    </template>
                  </v-radio>
                  <v-radio class="mx-2" :value="ID_PROVIDERS.BCEIDBOTH_WITH_CATCHMENT">
                    <template #label>
                      <span :class="{ 'mr-2': isRTL }"> Basic or Business BCeID (Catchment Protected) </span>
                    </template>
                  </v-radio>
                  <!-- Mandatory BCeID process notification -->
                  <!--
                  <v-expand-transition>
                    <BaseInfoCard
                      v-if="
                        idps[0] &&
                        [
                          ID_PROVIDERS.BCEIDBASIC,
                          ID_PROVIDERS.BCEIDBUSINESS,
                        ].includes(idps[0])
                      "
                      class="mr-4"
                      :class="{ 'dir-rtl': isRTL }"
                    >
                      <h4 class="primary--text" :lang="lang">
                        <v-icon class="mr-1" color="primary">info</v-icon
                        >{{ $t('trans.formSettings.important') }}!
                      </h4>
                      <p class="my-2" :lang="lang">
                        {{ $t('trans.formSettings.idimNotifyA') }} (<a
                          href="mailto:IDIM.Consulting@gov.bc.ca"
                          >IDIM.Consulting@gov.bc.ca</a
                        >) {{ $t('trans.formSettings.idimNotifyB') }}
                      </p>
                      <p class="mt-2 mb-0" :lang="lang">
                        {{ $t('trans.formSettings.referenceGuideA') }}
                        <a
                          href="https://github.com/bcgov/common-hosted-form-service/wiki/Accessing-forms#Notify-the-idim-team-if-you-are-using-bceid"
                          :hreflang="lang"
                          >{{ $t('trans.formSettings.referenceGuideB') }}</a
                        >
                        {{ $t('trans.formSettings.referenceGuideC') }}.
                      </p>
                    </BaseInfoCard>
                  </v-expand-transition>
                  -->
                </v-radio-group>
              </v-row>
            </v-expand-transition>
            <v-radio value="team">
              <template #label>
                <span :class="{ 'mr-2': isRTL }" :lang="lang">
                  {{ $t('trans.formSettings.specificTeamMembers') }}
                </span>
              </template>
            </v-radio>
          </v-radio-group>
        </BasePanel>
        <!-- TODO: look into using <FormAccessSettings /> -->
      </v-col>
      <v-col cols="12" md="6">
        <FormFunctionalitySettings :disabled="disabled" />
      </v-col>
      <v-col cols="12" md="6">
        <FormSubmissionSettings />
      </v-col>
      <v-col v-if="form.schedule.enabled && isFormPublished" cols="12" md="6">
        <FormScheduleSettings />
      </v-col>
    </v-row>
  </v-container>
</template>
