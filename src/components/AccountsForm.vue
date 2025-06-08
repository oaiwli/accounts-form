<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'

interface Label {
  text: string
}

interface AccountForm {
  id: number
  labelsInput: string // Временное хранилище для ввода
  labels: Label[] // Фактическое значение
  type: string | null
  login: string
  password: string
  errors: {
    login?: boolean
    password?: boolean
  }
}

export default defineComponent({
  setup() {
    const forms = ref<AccountForm[]>([])
    const STORAGE_KEY = 'accountForms'

    const options = ref([
      { label: 'LDAP', value: 'LDAP' },
      { label: 'Локальная', value: 'Локальная' },
    ])

    const loadForms = () => {
      const savedForms = localStorage.getItem(STORAGE_KEY)
      if (savedForms) {
        forms.value = JSON.parse(savedForms)
        // Конвертируем старые данные (если labels были строкой)
        forms.value.forEach((form) => {
          if (typeof form.labels === 'string') {
            form.labelsInput = form.labels
            form.labels = parseLabels(form.labels)
          }
          if (!form.labelsInput) {
            form.labelsInput = formatLabels(form.labels)
          }
        })
      }
    }

    const saveForms = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(forms.value))
    }

    const parseLabels = (labelsString: string): Label[] => {
      if (!labelsString.trim()) return []
      return labelsString
        .split(';')
        .map((label) => label.trim())
        .filter((label) => label.length > 0)
        .map((label) => ({ text: label }))
    }

    const formatLabels = (labels: Label[]): string => {
      return labels.map((label) => label.text).join('; ')
    }

    const addForm = () => {
      forms.value.push({
        id: Date.now(),
        labelsInput: 'Значение',
        labels: [{ text: 'Значение' }],
        type: 'LDAP',
        login: 'Значение',
        password: '',
        errors: {},
      })
      saveForms()
    }

    const removeForm = (id: number) => {
      forms.value = forms.value.filter((form) => form.id !== id)
      saveForms()
    }

    const validateForm = (form: AccountForm) => {
      form.errors = {}
      let isValid = true

      if (!form.login.trim()) {
        form.errors.login = true
        isValid = false
      }

      if (form.type === 'Локальная' && !form.password.trim()) {
        form.errors.password = true
        isValid = false
      }

      return isValid
    }

    const handleLabelsBlur = (form: AccountForm) => {
      form.labels = parseLabels(form.labelsInput)
      saveForms()
    }

    const handleBlur = (form: AccountForm, field: 'login' | 'password') => {
      if (validateForm(form)) saveForms()
    }

    const handleSelectChange = (form: AccountForm) => {
      if (validateForm(form)) saveForms()
    }

    onMounted(() => {
      loadForms()
    })

    return {
      forms,
      options,
      addForm,
      removeForm,
      handleLabelsBlur,
      handleBlur,
      handleSelectChange,
      validateForm,
      formatLabels,
    }
  },
})
</script>

<template>
  <n-card class="container">
    <div class="header">
      <n-h1 class="headerText">Учетные записи</n-h1>
      <n-button @click="addForm">
        <template #icon>
          <n-icon>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
            </svg>
          </n-icon>
        </template>
      </n-button>
    </div>

    <div class="helperText">
      <n-icon size="24" class="helpSvg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 17v.01"></path>
            <path d="M12 13.5a1.5 1.5 0 0 1 1-1.5a2.6 2.6 0 1 0-3-4"></path>
          </g>
        </svg>
      </n-icon>
      <span class="helpText">
        Для указания нескольких меток для одной пары логин/пароль используйте разделитель ;
      </span>
    </div>

    <n-space vertical class="boxForm" v-if="forms.length > 0">
      <div class="formHead">
        <p class="formText label">Метки</p>
        <p class="formText type">Тип записи</p>
        <p class="formText login">Логин</p>
        <p class="formText password">Пароль</p>
      </div>

      <n-space vertical v-for="form in forms" :key="form.id">
        <n-space>
          <n-input
            v-model:value="form.labelsInput"
            @blur="handleLabelsBlur(form)"
            type="text"
            placeholder=""
            class="metka"
            :maxlength="50"
            style="width: 180px"
          />
          <n-select
            v-model:value="form.type"
            :options="options"
            class="select"
            placeholder=""
            @update:value="() => handleSelectChange(form)"
            style="width: 180px"
          />
          <n-input
            v-model:value="form.login"
            type="text"
            placeholder=""
            :maxlength="100"
            :style="{ width: form.type === 'Локальная' ? '174px' : '360px' }"
            @blur="handleBlur(form, 'login')"
            :status="form.errors.login ? 'error' : undefined"
          />
          <n-input
            v-if="form.type === 'Локальная'"
            v-model:value="form.password"
            type="password"
            show-password-on="mousedown"
            placeholder=""
            :maxlength="100"
            @blur="handleBlur(form, 'password')"
            :status="form.errors.password ? 'error' : undefined"
            style="width: 174px"
          />
          <n-button class="delete-button" quaternary @click="removeForm(form.id)">
            <template #icon>
              <n-icon size="24">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" color="#717170">
                  <path
                    d="M12 1.75a3.25 3.25 0 0 1 3.245 3.066L15.25 5h5.25a.75.75 0 0 1 .102 1.493L20.5 6.5h-.796l-1.28 13.02a2.75 2.75 0 0 1-2.561 2.474l-.176.006H8.313a2.75 2.75 0 0 1-2.714-2.307l-.023-.174L4.295 6.5H3.5a.75.75 0 0 1-.743-.648L2.75 5.75a.75.75 0 0 1 .648-.743L3.5 5h5.25A3.25 3.25 0 0 1 12 1.75zm6.197 4.75H5.802l1.267 12.872a1.25 1.25 0 0 0 1.117 1.122l.127.006h7.374c.6 0 1.109-.425 1.225-1.002l.02-.126L18.196 6.5zM13.75 9.25a.75.75 0 0 1 .743.648L14.5 10v7a.75.75 0 0 1-1.493.102L13 17v-7a.75.75 0 0 1 .75-.75zm-3.5 0a.75.75 0 0 1 .743.648L11 10v7a.75.75 0 0 1-1.493.102L9.5 17v-7a.75.75 0 0 1 .75-.75zm1.75-6a1.75 1.75 0 0 0-1.744 1.606L10.25 5h3.5A1.75 1.75 0 0 0 12 3.25z"
                    fill="currentColor"
                  />
                </svg>
              </n-icon>
            </template>
          </n-button>
        </n-space>
      </n-space>
    </n-space>
  </n-card>
</template>

<style scoped>
.container {
  margin: 0;
  height: 100%;
  width: 100%;
  padding: 16px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.headerText {
  margin: 0;
  font-size: 24px;
  line-height: 1;
}

.helperText {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  background-color: #eef4fa;
  padding: 12px;
  width: fit-content;
}

.helpSvg {
  flex-shrink: 0;
}

.helpText {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

.formHead {
  display: flex;
}

.formText {
  color: #cccccc;
}

.type {
  margin-left: 150px;
}

.login {
  margin-left: 116px;
}

.password {
  margin-left: 145px;
}

.boxForm {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}
</style>
