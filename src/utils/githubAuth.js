import { graphql } from '@octokit/graphql'
import axios from 'axios'

export class GitHubAuthManager {
  constructor(token, tokenType = 'classic') {
    this.token = token
    this.tokenType = tokenType
    this.setupClients()
  }

  setupClients() {
    // Setup REST API client
    this.restClient = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: this.getAuthHeader(),
        Accept: 'application/vnd.github.v3+json',
        ...(this.tokenType === 'fine-grained' && {
          'X-GitHub-Api-Version': '2022-11-28'
        })
      }
    })

    // Setup GraphQL client
    this.graphqlClient = graphql.defaults({
      headers: {
        authorization: this.getAuthHeader(),
        ...(this.tokenType === 'fine-grained' && {
          'X-GitHub-Api-Version': '2022-11-28'
        })
      }
    })
  }

  getAuthHeader() {
    return `${this.tokenType === 'fine-grained' ? 'Bearer' : 'token'} ${this.token}`
  }

  async validateToken() {
    try {
      const response = await this.restClient.get('/user')
      return {
        valid: true,
        username: response.data.login,
        scopes: response.headers['x-oauth-scopes']?.split(', ') || []
      }
    } catch (error) {
      return {
        valid: false,
        error: error.response?.data?.message || 'Token validation failed'
      }
    }
  }
}

export class GitHubClassicAuth {
  constructor(token) {
    this.token = token
    this.requiredScopes = ['read:user', 'repo']
  }

  async validateToken() {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        throw new Error('Invalid token')
      }

      const scopes = response.headers.get('x-oauth-scopes')?.split(', ') || []
      const hasRequiredScopes = this.requiredScopes.every(scope => 
        scopes.includes(scope)
      )

      if (!hasRequiredScopes) {
        throw new Error('Token missing required scopes')
      }

      const userData = await response.json()
      return {
        isValid: true,
        username: userData.login,
        scopes: scopes
      }
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      }
    }
  }

  createApiClient() {
    return {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    }
  }
} 