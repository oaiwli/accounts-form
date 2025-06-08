<script setup lang="ts">
import AccountsForm from './components/AccountsForm.vue'
</script>

<template>
  <n-message-provider>
    <n-loading-bar-provider>
      <n-notification-provider>
        <n-dialog-provider>
          <n-layout>
            <n-layout-content>
              <AccountsForm />
            </n-layout-content>
          </n-layout>
        </n-dialog-provider>
      </n-notification-provider>
    </n-loading-bar-provider>
  </n-message-provider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
