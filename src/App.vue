<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { graphql } from '@octokit/graphql'
import GitHubCalendar from 'vue-github-calendar'
//import 'vue-github-calendar/dist/style.css'


// Use token from .env
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN

// Create pre-configured API clients
const axiosClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json'
  }
})

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${GITHUB_TOKEN}`,
  },
})

// Rest of your existing refs
const username = ref('')
const userData = ref(null)
const contributionData = ref(null)
const loading = ref(false)
const error = ref(null)

const fetchContributions = async (username) => {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            description
            stargazerCount
            languages(first: 1) {
              nodes {
                name
              }
            }
          }
        }
      }
    }
  `

  const response = await graphqlWithAuth(query, { username })
  return response
}

const fetchGithubData = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Use axiosClient instead of axios directly
    const [userResponse, reposResponse] = await Promise.all([
      axiosClient.get(`/users/${username.value}`),
      axiosClient.get(`/users/${username.value}/repos`)
    ])

    userData.value = {
      profile: userResponse.data,
      repositories: reposResponse.data
    }

    // Fetch contribution data with GraphQL
    const graphqlData = await fetchContributions(username.value)
    contributionData.value = {
      totalContributions: graphqlData.user.contributionsCollection.contributionCalendar.totalContributions,
      calendar: graphqlData.user.contributionsCollection.contributionCalendar,
      topLanguages: calculateTopLanguages(graphqlData.user.repositories.nodes)
    }

  } catch (err) {
    error.value = 'Error fetching GitHub data. Please check the username.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const calculateTopLanguages = (repositories) => {
  const languageCount = {}
  repositories.forEach(repo => {
    if (repo.languages.nodes[0]) {
      const lang = repo.languages.nodes[0].name
      languageCount[lang] = (languageCount[lang] || 0) + 1
    }
  })
  
  return Object.entries(languageCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
}
</script>

<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">GitHub Profile Viewer</h1>
    
    <!-- Search Form -->
    <div class="mb-4">
      <input
        v-model="username"
        type="text"
        placeholder="Enter GitHub username"
        class="border p-2 mr-2 rounded text-black"
        @keyup.enter="fetchGithubData"
      >
      <button 
        @click="fetchGithubData"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Search
      </button>
    </div>

    <!-- Loading and Error States -->
    <p v-if="loading" class="text-gray-600">Loading...</p>
    <p v-if="error" class="text-red-500">{{ error }}</p>

    <!-- User Data Display -->
    <div v-if="userData" class="mt-6">
      <!-- Profile Section -->
      <div class="mb-6 flex items-start gap-4">
        <img 
          :src="userData.profile.avatar_url" 
          :alt="userData.profile.login"
          class="w-24 h-24 rounded-full"
        >
        <div>
          <h2 class="text-xl font-bold">{{ userData.profile.name }}</h2>
          <p class="text-gray-600">{{ userData.profile.login }}</p>
          <p class="mt-2">{{ userData.profile.bio }}</p>
          <div class="mt-2 flex gap-4">
            <span>Followers: {{ userData.profile.followers }}</span>
            <span>Following: {{ userData.profile.following }}</span>
            <span>Public Repos: {{ userData.profile.public_repos }}</span>
          </div>
        </div>
      </div>

      <!-- Contribution Section -->
      <div v-if="contributionData" class="mt-8">
        <h3 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Contribution Activity</h3>
        
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div class="mb-4 flex items-center">
            <span class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ contributionData.totalContributions }}
            </span>
            <span class="text-gray-600 dark:text-gray-400 ml-3">
              contributions in the last year
            </span>
          </div>

          <!-- Contribution Calendar -->
          <GitHubCalendar 
            :username="username"
            :data="contributionData.calendar"
            class="mb-6"
          />

          <!-- Top Languages -->
          <div class="mt-6">
            <h4 class="font-bold mb-3 text-gray-800 dark:text-white">Top Languages</h4>
            <div class="flex flex-wrap gap-3">
              <span 
                v-for="[lang, count] in contributionData.topLanguages" 
                :key="lang"
                class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                {{ lang }} ({{ count }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Repositories Section -->
      <h3 class="text-xl font-bold mb-4">Repositories</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="repo in userData.repositories" 
          :key="repo.id"
          class="border p-4 rounded hover:shadow-md transition-shadow"
        >
          <h4 class="font-bold text-lg">{{ repo.name }}</h4>
          <p class="text-gray-600 text-sm mb-2">{{ repo.description }}</p>
          <div class="flex gap-4 text-sm">
            <span>⭐ {{ repo.stargazers_count }}</span>
            <span>🔀 {{ repo.forks_count }}</span>
            <span>{{ repo.language }}</span>
          </div>
          <a 
            :href="repo.html_url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-500 hover:underline text-sm mt-2 inline-block"
          >
            View Repository →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>