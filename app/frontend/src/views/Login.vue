<script setup>
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useAuthStore } from '~/store/auth';
import { useIdpStore } from '~/store/identityProviders';

const { locale } = useI18n({ useScope: 'global' });

defineProps({
  idpHint: {
    type: Array,
    default: () => [],
  },
});

const authStore = useAuthStore();
const idpStore = useIdpStore();

const { authenticated, ready } = storeToRefs(authStore);
const { loginButtons } = storeToRefs(idpStore);
</script>

<template>
  <v-container class="text-center">
    <div v-if="ready && !authenticated">
      <h1 class="my-6" :lang="locale">
        {{ $t('trans.login.authenticateWith') }}
      </h1>
      <v-row v-for="button in loginButtons" :key="button.code" justify="center">
        <v-col sm="3">
          <v-btn
            block
            color="primary"
            size="large"
            :data-test="button.code"
            :title="button.display"
            @click="authStore.login(button.hint)"
          >
            {{ button.display }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
    <div v-else-if="ready && authenticated">
      <h1 class="my-6" :lang="locale">
        {{ $t('trans.login.alreadyLoggedIn') }}
      </h1>
      <router-link :to="{ name: 'About' }">
        <v-btn
          class="ma-2"
          color="primary"
          size="large"
          :lang="locale"
          :title="$t('trans.login.about')"
        >
          <v-icon start icon="mdi-home"></v-icon>
          <span :lang="locale">{{ $t('trans.login.about') }}</span>
        </v-btn>
      </router-link>
    </div>
    <div v-else>
      <h1 class="my-6">
        Identity and Access Management not ready, please contact technical
        support.
      </h1>
    </div>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { IdentityProviders } from '@/utils/constants';

export default {
  name: 'Login',
  props: {
    idpHint: {
      type: Array,
      default: () => [
        IdentityProviders.IDIR,
        IdentityProviders.BCEIDBOTH,
      ],
    },
  },
  created() {
    // If component gets idpHint, invoke login flow via vuex
    if (this.idpHint && this.idpHint.length === 1) this.login(this.idpHint[0]);
  },
  computed: {
    ...mapGetters('auth', ['authenticated', 'createLoginUrl', 'keycloakReady']),
    ...mapGetters('form', ['lang']),
    buttons: () => [
      {
        label: 'IDIR',
        type: IdentityProviders.IDIR,
      },
      {
        label: 'Basic or Business BCeID',
        type: IdentityProviders.BCEIDBOTH,
      }
    ],
    IDPS() {
      return IdentityProviders;
    },
  },
  methods: {
    ...mapActions('auth', ['login']),
    buttonEnabled(type) {
      console.log(this.idpHint);
      return this.idpHint ? this.idpHint.includes(type) : false;
    },
  },
};
</script>
<style lang="scss">
.v-btn > .v-btn__content {
  font-weight: bold !important;
}
</style>
