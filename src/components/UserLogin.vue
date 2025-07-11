<template>
  <div class="auth-form">
    <h2>Logowanie</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Hasło" required />
      <button type="submit">Zaloguj się</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

export default {
  name: 'UserLogin',
  data() {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password)
        this.$router.push('/dashboard')
      } catch (err) {
        this.error = 'Błąd logowania: ' + err.message
      }
    }
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: auto;
}
input {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
}
.error {
  color: red;
}
</style>
