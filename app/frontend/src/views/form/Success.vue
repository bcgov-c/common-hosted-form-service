<template>
  <div>
    <FormViewer :submissionId="s" :readOnly="true" displayTitle>
      <template #alert="{ form, submission }">
        <div class="mb-5">
          <h1 v-if="submission.data.lang === 'en' || submission.data.lang === ''" class="mb-5">
            <v-icon large color="success">check_circle</v-icon>
            Your form has been submitted successfully
          </h1>
          <h1 v-if="submission.data.lang === 'fr'" class="mb-5">
            <v-icon large color="success">check_circle</v-icon>
            Votre formulaire a été soumis avec succès
          </h1>
          <div v-if="form.showSubmissionConfirmation">
            <h3>
              <span v-if="submission.data.lang === 'en' || submission.data.lang === ''" class="d-print-none">
                If you wish to keep a record of this submission, you can keep
                the following
              </span>
              <span v-if="submission.data.lang === 'fr'" class="d-print-none">
                Si vous souhaitez conserver une trace de cette soumission, vous pouvez conserver
              </span>
              <span v-if="submission.data.lang === 'en' || submission.data.lang === ''">
                Confirmation ID:
                <mark>{{ s.substring(0, 8).toUpperCase() }}</mark>
              </span>
              <span v-if="submission.data.lang === 'fr'">
                l'ID de confirmation suivant:
                <mark>{{ s.substring(0, 8).toUpperCase() }}</mark>
              </span>
            </h3>
            <RequestReceipt
              class="d-print-none"
              :email="email"
              :formName="form.name"
              :submissionId="s"
              :lang="submission.data.lang"
            />
          </div>
          <hr />
        </div>
      </template>
    </FormViewer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import FormViewer from '@/components/designer/FormViewer.vue';
import RequestReceipt from '@/components/forms/RequestReceipt.vue';

export default {
  name: 'FormView',
  props: {
    s: String,
  },
  components: {
    FormViewer,
    RequestReceipt,
  },
  computed: mapGetters('auth', ['email'])
};
</script>
