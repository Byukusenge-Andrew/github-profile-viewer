<script setup>
import { ref } from 'vue'
import { GitHubClassicAuth } from '../utils/githubAuth'

const emit = defineEmits(['auth-success', 'auth-error'])

const token = ref('')
const loading = ref(false)
const error = ref('')

const validateToken = async () => {
  if (!token.value) {
    error.value = 'Please enter a token'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const auth = new GitHubClassicAuth(token.value)
    const result = await auth.validateToken()

    if (result.isValid) {
      emit('auth-success', {
        token: token.value,
        username: result.username,
        scopes: result.scopes
      })
    } else {
      error.value = result.error
      emit('auth-error', result.error)
    }
  } catch (err) {
    error.value = 'Authentication failed'
    emit('auth-error', err.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-bold mb-4">GitHub Classic Token Authentication</h2>
    
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Personal Access Token (Classic)
      </label>
      <input
        v-model="token"
        type="password"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter your GitHub token"
        @keyup.enter="validateToken"
      />
    </div>

    <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
      {{ error }}
    </div>

    <button
      @click="validateToken"
      :disabled="loading"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
    >
      {{ loading ? 'Validating...' : 'Authenticate' }}
    </button>

    <div class="mt-4 text-sm text-gray-600">
      <h3 class="font-medium mb-2">Required Scopes:</h3>
      <ul class="list-disc pl-5">
        <li>read:user - Access user profile data</li>
        <li>repo - Access repository data</li>
      </ul>
      
      <div class="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md">
        <p class="font-medium">How to create a Classic token:</p>
        <ol class="list-decimal pl-5 mt-2">
          <li>Go to GitHub Settings</li>
          <li>Developer Settings → Personal Access Tokens</li>
          <li>Tokens (classic)</li>
          <li>Generate new token (classic)</li>
          <li>Select the required scopes above</li>
          <li>Generate and copy the token</li>
        </ol>
      </div>
    </div>
  </div>
</template> 