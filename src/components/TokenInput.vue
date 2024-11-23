<script setup>
import { ref } from 'vue'
import { GitHubAuthManager } from '../utils/githubAuth'

const emit = defineEmits(['token-validated'])

const token = ref('')
const tokenType = ref('classic')
const error = ref('')
const loading = ref(false)

const validateToken = async () => {
  if (!token.value) {
    error.value = 'Please enter a token'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const authManager = new GitHubAuthManager(token.value, tokenType.value)
    const validation = await authManager.validateToken()

    if (validation.valid) {
      emit('token-validated', {
        token: token.value,
        type: tokenType.value,
        username: validation.username,
        scopes: validation.scopes
      })
    } else {
      error.value = validation.error
    }
  } catch (err) {
    error.value = 'Failed to validate token'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">GitHub Authentication</h2>
    
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Token Type</label>
      <div class="flex gap-4">
        <label class="flex items-center">
          <input
            type="radio"
            v-model="tokenType"
            value="classic"
            class="mr-2"
          >
          Classic Token
        </label>
        <label class="flex items-center">
          <input
            type="radio"
            v-model="tokenType"
            value="fine-grained"
            class="mr-2"
          >
          Fine-grained Token
        </label>
      </div>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">GitHub Token</label>
      <input
        v-model="token"
        type="password"
        placeholder="Enter your GitHub token"
        class="w-full p-2 border rounded"
      >
    </div>

    <div v-if="error" class="mb-4 text-red-500 text-sm">
      {{ error }}
    </div>

    <button
      @click="validateToken"
      :disabled="loading"
      class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {{ loading ? 'Validating...' : 'Validate Token' }}
    </button>

    <div class="mt-4 text-sm text-gray-600">
      <p class="font-medium">Required Permissions:</p>
      <template v-if="tokenType === 'classic'">
        <ul class="list-disc ml-5">
          <li>read:user</li>
          <li>repo</li>
        </ul>
      </template>
      <template v-else>
        <ul class="list-disc ml-5">
          <li>Repository permissions:
            <ul class="list-disc ml-5">
              <li>Contents: Read-only</li>
              <li>Metadata: Read-only</li>
            </ul>
          </li>
          <li>Account permissions:
            <ul class="list-disc ml-5">
              <li>Public profile: Read-only</li>
            </ul>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template> 